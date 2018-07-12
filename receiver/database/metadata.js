import fs from 'fs'
import path from 'path'
import moment from 'moment'
import Datastore from 'nedb'
import logger from './logger.js'
import mkdirp from 'mkdirp'
import omit from 'object.omit'

// DB 파일 중복 핸들생성 방지용
var isOpenedFiles = {}

export default class Metadata {
	/**
	 * @description
	 *
	 * @param {string} folderPath
	 * @param {string} fileName
	 * @param {string} fileExt
	 * @param {function} callback
	 *    callback(loadSuccess, instance)
	 */
	constructor(folderPath, fileName, fileExt, callback){
		this.folderPath = folderPath
		this.fileName = fileName
		this.fileExt = fileExt

		// DB파일경로
		this.fullPath =
			path.join(this.folderPath
				+ '/' + this.fileName
				+ '.' + this.fileExt)

		// 인덱스 파일경로
		this.indexPath = this.fullPath + 'i'

		// DB이미 열려있는지 확인
		// 이미 열려있으면 열린 거 반환
		if(typeof isOpenedFiles[this.fullPath] != 'undefined'){
			if(typeof callback == 'function')
				callback(true, this)
			isOpenedFiles[this.fullPath].initCount++
			return isOpenedFiles[this.fullPath]
		}

		// 여러 곳에서 호출되고 있는 경우
		// 호출된 모든 곳에서 닫힐 때까지
		// 해당 인스턴스를 닫지 않고 유지합니다.
		// 아래는 그러한 확인을 위한 변수입니다.
		this.initCount = 1

		// DB 명령어 동일 실행 방지용
		this.commandQueue = []

		// DB 명령어 처리중 여부 확인용
		this.isIDLE = true

		this._reload(callback, true)
	}

	/**
	 * @description
	 *    메타리스트 ID인덱스 용으로
	 *    사용되는 10진법->36진법 변환함수입니다.
	 *
	 * @param {number} indexNum
	 * @return {string} base36
	 */
	encode36(indexNum){
		return Number(indexNum).toString(36)
	}

	/**
	 * @description
	 *    메타리스트 ID인덱스 용으로
	 *    사용되는 36진법->10진법 변환함수입니다.
	 *
	 * @param {string} base36
	 * @return {number} indexNum
	 */
	decode36(base36){
		return parseInt(base36, 36)
	}

	/**
	 * @description
	 * 최신순번의 메타데이터를 생성합니다.
	 *
	 * @param {object} paramKey
	 *    DB에서 선택하려는 데이터의 키를 여기에 넣습니다.
	 *
	 * @param {object} paramData
	 *    DB에 입력하려는 데이터를 여기에 넣습니다.
	 *
	 * @param {function} callback
	 *    callback(isSuccess, id, resolve)
	 */
	create(paramKey, paramData, callback){
		let self = this
		
		self.process((isSuccess)=>{

			// 실패했으면 그냥 반환
			if(!isSuccess){
				callback(false, 0, ()=>{self.resolve()})
				return
			}
			
			self._create(paramKey, paramData, callback, ()=>{self.resolve()})
		})
	}

	_create(paramKey, paramData, callback, resolve){
		let self = this

		// metadata 는 동기식으로
		// 먼저 '실행요청'한 순서대로
		// 함수를 실행시키므로
		// 이 순서로 사용하는 것이 맞습니다.

		let index = null
		let id = null
		self._change(`${paramKey}._latest`,
			(isSuccess, data, status)=>{

				// latest 읽어오기에 실패한 경우
				// 콜백에 이 상황을 알립니다.
				if(!isSuccess){
					if(typeof callback == 'function')
						callback(false, 'latest read', resolve)
					return
				}

				// 읽어온 index 에서 1을 더하기
				index = ( (data === null) ? 1 : Number(data)+1 )
				id = self.encode36(index)

				return {
					act: 'set',
					data: index
				}
			},(isSuccess, resolve)=>{
				// 일단 업데이트 중 키값이 겹치면 안되므로
				// 모든 작업 전 최우선으로 키 값먼저 올립니다.
			
				// latest 업데이트에 실패한 경우
				// 콜백에 이 상황을 알립니다.
				if(!isSuccess){
					if(typeof callback == 'function')
						callback(false, 'latest change', resolve)
					return
				}

				self._set(`${paramKey}.${id}`, paramData, ()=>{
					if(typeof callback == 'function')
						callback(true, id, resolve)
				})
			}
		)
	}

	/**
	 * @description
	 * 해당순번의 메타데이터를 읽어옵니다.
	 *
	 * @param {object} paramKey
	 *    DB에서 선택하려는 데이터의 키를 여기에 넣습니다.
	 *
	 * @param {string} paramId
	 *    DB에서 찾으려는 ID를 여기에 넣습니다.
	 *
	 * @param {function} callback
	 *    callback(isSuccess, data)
	 */
	read(paramKey, paramId, callback, isGetAll=false){
		let self = this
		self.process((isSuccess)=>{
			self._read(paramKey, paramId, (isSuccess, data)=>{
				if(typeof callback == 'function')
					callback(isSuccess, data)
				self.resolve()
			}, isGetAll)
		})
	}

	_read(paramKey, paramId, callback, isGetAll=false){
		let self = this
		let key = (typeof paramId === 'undefined' || paramId === null) ?  paramKey : `${paramKey}.${paramId}`

		if(isGetAll){
			self._get(key, callback, true)
			return
		}

		self._get(key, (isSuccess, data)=>{
			// _latest 제외하고 전달
			if(isSuccess && typeof data == 'object'
			   && data !== null && typeof data['_latest'] != 'undefined')
				delete data['_latest']
			
			if(typeof callback == 'function')
				callback(isSuccess, data)
		})
	}

	/**
	 * @description
	 * 해당순번의 메타데이터 정보를 갱신합니다.
	 *
	 * @param {object} paramKey
	 *    DB에서 선택하려는 데이터의 키를 여기에 넣습니다.
	 *
	 * @param {string} paramId
	 *    DB에서 찾으려는 ID를 여기에 넣습니다.
	 *
	 * @param {object} paramData
	 *    DB에 갱신하려는 데이터를 여기에 넣습니다.
	 *
	 * @param {function} callback
	 *    callback(isSuccess)
	 */
	update(paramKey, paramId, paramData, callback){
		let self = this
		let key = (typeof paramId === 'undefined' || paramId === null) ?  paramKey : `${paramKey}.${paramId}`

		self.set(key, paramData, callback)
	}

	_update(paramKey, paramId, paramData, callback){
		let self = this
		let key = (typeof paramId === 'undefined' || paramId === null) ?  paramKey : `${paramKey}.${paramId}`

		self._set(key, paramData, callback)
	}

	/**
	 * @description
	 * 해당순번의 메타데이터를 삭제합니다.
	 *
	 * @param {object} paramKey
	 *    DB에서 선택하려는 데이터의 키를 여기에 넣습니다.
	 *
	 * @param {string} paramId
	 *    DB에서 삭제하려는 ID를 여기에 넣습니다.
	 *
	 * @param {function} callback
	 *    callback(isSuccess, unsettedCount)
	 *
	 * @param {boolean} isUnsetAll
	 *    리스트를 담던 상위 키를 지울때 true로 놓으면
	 *    지운 숫자를 알려줄 때 _least 숫자를 뺀만큼 알려줍니다.
	 */
	delete(paramKey, paramId, callback, isUnsetAll=false){
		let self = this

		self.process((isSuccess)=>{

			// 실패했으면 그냥 반환
			if(!isSuccess){
				callback(false, 0)
				self.resolve()
				return
			}

			self._delete(paramKey, paramId, callback, isUnsetAll, ()=>{self.resolve()})
		})
	}
	
	_delete(paramKey, paramId, callback, isUnsetAll=false, resolve){
		let self = this
		let key = (typeof paramId === 'undefined' || paramId === null) ?  paramKey : `${paramKey}.${paramId}`

		self._unset(key, function innerToss(isSuccess, unsettedCount1){

			// 실패했으면 그냥 반환
			if(!isSuccess){
				callback(false, 0)
				if(typeof resolve === 'function') resolve()
				return
			}

			if(isUnsetAll){
				callback(true, (unsettedCount1 > 0) ? unsettedCount1 -1 : unsettedCount1)
				if(typeof resolve === 'function') resolve()
				return
			}

			if(typeof self.getByPath(self.index, paramKey) != 'undefined' &&
			   Object.keys(self.getByPath(self.index, paramKey)).length <= 1){

					// 키 삭제에 성공해서
					// _latest 키만 남은 경우
					// 해당 리스트 초기화
					self._unset(paramKey, function innerToss(isSuccess, unsettedCount2){

						// 실패했으면 그냥 반환
						if(!isSuccess){
							callback(false, 0)
							if(typeof resolve === 'function') resolve()
							return
						}

						// isUnsetAll 가 참인 경우 _latest 갯수 제외한 나머지 반환
						let finallyUnsettedCount = Number(unsettedCount1) + Number(unsettedCount2)
						if(isNaN(finallyUnsettedCount)) finallyUnsettedCount = 0

						callback(true, finallyUnsettedCount)
						if(typeof resolve === 'function') resolve()
					})
				return
			}

			// isUnsetAll 가 참인 경우 _latest 갯수 제외한 나머지 반환
			let firstUnsettedCount = Number(unsettedCount1)
			if(isNaN(firstUnsettedCount)) firstUnsettedCount = 0

			callback(true, firstUnsettedCount)
			if(typeof resolve === 'function') resolve()
			return

		})
	}

	/**
	 * @description
	 * 해당순번의 메타데이터를 삭제합니다.
	 *
	 * @param {string} id
	 *    DB에서 삭제하려는 ID를 여기에 넣습니다.
	 *
	 * @param {function} callback
	 *    callback(isExist, dataCount)
	 */
	check(paramKey, paramId, callback){
		let self = this
		self.exist(`${paramKey}.${paramId}`, callback)
	}

	/**
	 * @description
	 * DB에 특정 키에 해당하는 값을
	 * 찾아서 업데이트 하는 함수 입니다.
	 *
	 * @param {string} paramKey
	 *    키는 파일을 담아놓는폴더처럼
	 *    nested 형태의 구조를 허용합니다.
	 *
	 *    자바의 네임스페이스 구조처럼
	 *    'hm.pw.num' 와 같은 키값을 사용가능합니다.
	 *
	 *    해당 키값의 인덱스 저장형태는 hm : { pw: '' } 와 같습니다.
	 *
	 * @param {function} changeCallback
	 *    changeCallback(isSuccess, data, status)
	 *
	 * @param {function} statusCallback
	 *    statusCallback(isSuccess)
	 */
	change(paramKey, changeCallback, statusCallback){
		// 콜백이 함수가 아니면 그냥 반환
		if(typeof changeCallback != 'function' ||
			typeof statusCallback != 'function' ) return
	
		let self = this
		self.process((isSuccess)=>{
			// 실패했어도 그냥 반환
			if(!isSuccess){
				statusCallback(false)
				self.resolve()
				return
			}

			self._change(paramKey, changeCallback, statusCallback)
		})
		return this
	}
	
	_change(paramKey, changeCallback, statusCallback){
		// 콜백이 함수가 아니면 그냥 반환
		if(typeof changeCallback != 'function' ||
			typeof statusCallback != 'function' ) return
		
		let self = this
		self._get(paramKey, function innerToss(){
			// 찾은 데이터를 다 전달한 후
			// 입력할 값을 콜백에서 받습니다.
			let response = changeCallback(...arguments)

			if(response === undefined
			  || response === null){
				self.resolve()
				return
			}

			if(typeof response != 'object' ||
				typeof response['act'] == 'undefined'){

				statusCallback(false)
				self.resolve()
				return
			}

			switch(response.act){
				case 'unset':
					self._unset(paramKey, function innerToss(isSuccess, unsettedCount){
						statusCallback(isSuccess, ()=>{self.resolve()})
					})
					break
				case 'set':
					self._set(paramKey, response.data, function innerToss(isSuccess){
						statusCallback(isSuccess, ()=>{self.resolve()})
					})
					break
				case 'none':
				default:
					statusCallback(true, ()=>{self.resolve()})
					break
			}
		})
	}

	/**
	 * @description
	 * DB에 특정 키에 해당하는 값을
	 * 찾아서 콜백에 반환하는 함수 입니다.
	 *
	 * @param {string} paramKey
	 *    키는 파일을 담아놓는폴더처럼
	 *    nested 형태의 구조를 허용합니다.
	 *
	 *    자바의 네임스페이스 구조처럼
	 *    'hm.pw.num' 와 같은 키값을 사용가능합니다.
	 *
	 *    해당 키값의 인덱스 저장형태는 hm : { pw: '' } 와 같습니다.
	 *
	 * @param {function} superCallback
	 *    callback(isSuccess, data, status)
	 */
	get(paramKey, callback, isGetAll = false){
		let self = this
		self.process((isSuccess)=>{
			if(!isSuccess){
				if(typeof callback == 'function')
					callback(false)
				self.resolve()
				return
			}
			self._get(paramKey, function innerToss(){
				if(typeof callback == 'function')
					callback(...arguments)
				self.resolve()
			}, isGetAll)
		})
		return this
	}

	/**
	 * @description
	 * DB에 특정 키에 해당하는 값을
	 * 찾아서 콜백에 반환하는 함수 입니다.
	 *
	 * @param {string} paramKey
	 *    키는 파일을 담아놓는폴더처럼
	 *    nested 형태의 구조를 허용합니다.
	 *
	 *    자바의 네임스페이스 구조처럼
	 *    'hm.pw.num' 와 같은 키값을 사용가능합니다.
	 *
	 *    해당 키값의 인덱스 저장형태는 hm : { pw: '' } 와 같습니다.
	 *
	 * @param {function} superCallback
	 *    superCallback(isSuccess, data, status)
	 */
	getAll(paramKey, superCallback){
		this.get(paramKey, superCallback, true)
		return this
	}

	_get(paramKey,superCallback, isGetAll = false){
		let paramKeyParse = paramKey.split('.')

		// 클로저 내부에서 인스턴스 접근용
		let self = this

		// 네임스페이스 해석
		self.parseNamespace(paramKeyParse, [], self.index, 0, false, (innerObj, preObj, i)=>{
			let readId = null
			if(innerObj === undefined || innerObj === null){
				if(typeof superCallback == 'function')
					superCallback(true, null, {}, 'Metadata index has empty')
				return
			}

			// 해당 위치에 아무것도 없는 경우
			if(innerObj[paramKeyParse[i]] === undefined
				|| innerObj[paramKeyParse[i]] === null){
				if(typeof superCallback == 'function')
					superCallback(true, null, {},  `Metadata can't find ${paramKeyParse[i]} key in index`)
				return
			}

			// 해당 위치가 비어있는 경우
			if(typeof paramKeyParse == 'array'
			   && typeof paramKeyParse[i] == 'string'
			   && typeof innerObj === 'object'
			   && Object.keys(innerObj[paramKeyParse[i]]).length === 0){

				if(typeof superCallback == 'function')
					superCallback(true, null, {}, 'Metadata index has empty')
				return
			}

			// 객체가 아닌 다른 유형의 정보가 있는 경우
			if(typeof innerObj[paramKeyParse[i]] !== 'object'){
				throw new Error(`Metadata can't read ${paramKeyParse[i]} key path. It's not object (${JSON.stringify(innerObj[paramKeyParse[i]])})`)
				return
			}

			// 중간단계의 경로를 입력한 경우
			// 폴더를 입력한경우 하위의 모든 값을
			// 경로와 함께 묶어서 돌려주는데

			// _id형태로 줄수 없므로 재귀함수를 통해서
			//_id 대신 값을 찾아내서 값을 반환합니다.

			let count = 0
			let originalPath = innerObj[paramKeyParse[i]]
			
			let collectedObj = {}
			let nestedGetter = (innerIndex, innerIndexKey, callback)=> {

				// 같은 층에서 수평방향으로 루프
				for(let o in innerIndex){

					// 객체를 찾은 경우
					// 다시 한번 검색
					if(typeof innerIndex[o] === 'object')
						nestedGetter(innerIndex[o], `${innerIndexKey}.${o}`, callback)

					// 직접 접근 가능한 _id를 찾은 경우
					else if(o == '_id' && typeof innerIndex[o] === 'string'){

						// 총 불러온 개수 증가
						count++

						// _id 를 찾아와서 해당 하는
						// 오브젝트 값으로 교체해 넣습니다.
						self.db.findOne({_id:innerIndex[o]},(error, doc)=>{
							let innerCurrentKey = innerIndexKey.split('.')
							innerCurrentKey = innerCurrentKey[innerCurrentKey.length -1]
							
							let isHighestKey = innerCurrentKey == innerIndexKey
							if(isHighestKey){

								// 만약 최상단 키로 뭔가 값이 들어있는 경우
								collectedObj['_value'] = doc[innerCurrentKey]

								if(!isGetAll){
									count = -1
									callback(collectedObj)
									return
								}
							}else{

								// 해당 경로가 오브젝트에 없으면 생성
								if(typeof collectedObj[doc] == 'undefined')
									collectedObj[innerCurrentKey] = {}
								collectedObj[innerCurrentKey]['_value'] =
									doc[innerCurrentKey]
							}

							// 전부 찾아낸 뒤에 한번만 콜백 호출
							//innerIndex[o] = doc[o]
							if(--count === 0){
								if(typeof callback == 'function')
									callback(collectedObj)
							}
						})
					}
				}
			}

			nestedGetter(originalPath, paramKeyParse[i], (values)=>{

				if(typeof superCallback == 'function'){
					let finalResult = (isGetAll) ? values : values._value
					superCallback(true, finalResult, 'Metadata successfully read data')
				}
			})
		})
		return this
	}

	/**
	 * @description
	 * DB에 특정 키에 해당하는 값을
	 * 저장 및 최신화하는 함수 입니다.
	 *
	 * @param {string} paramKey
	 *    키는 파일을 담아놓는폴더처럼
	 *    nested 형태의 구조를 허용합니다.
	 *
	 *    자바의 네임스페이스 구조처럼
	 *    'hm.pw.num' 와 같은 키값을 사용가능합니다.
	 *
	 *    해당 키값의 인덱스 저장형태는 hm : { pw: '' } 와 같습니다.
	 *
	 * @param paramData
	 *
	 * @param {function} callback
	 *    callback(isSuccess)
	 */
	set(paramKey, paramData, callback){
		let self = this
		self.process((isSuccess)=>{
			if(!isSuccess){
				if(typeof callback == 'function')
					callback(false)
				self.resolve()
				return
			}
			self._set(paramKey, paramData, function innerToss(){
				if(typeof callback == 'function')
					callback(...arguments)
				self.resolve()
			})
		})
		return this
	}

	_set(paramKey, paramData, callback){
		let paramKeyParse = paramKey.split('.')

		this.parseNamespace(paramKeyParse, [], this.index, 0, true, (innerObj, preObj, i) => {

			// 이미 해당 키가 존재하는 경우
			// 인덱스에 키값을 다시 생성하지 않고
			// 일치하는 키값의 데이터만 최신화합니다.
			if(typeof innerObj[paramKeyParse[i]] != 'undefined'
			   && typeof innerObj[paramKeyParse[i]]['_id'] != 'undefined'){

				let key = innerObj[paramKeyParse[i]]
				let preInsertData = {}
				preInsertData[paramKeyParse[i]] = paramData

				this.db.update({_id:key._id}, preInsertData, {$upsert:true,$returnUpdatedDocs: true},(error, numAffected,affectedDocuments,upsert)=>{
					if(typeof callback == 'function') callback(true)
					return
				})

				return
			}

			//해당 키가 존재하지 않는 경우 새로 생성합니다.
			let preUpdateData = {}
			
			// 업데이트할 객체를 생성합니다.
			preUpdateData[paramKeyParse[i]] = paramData

			// 실제 DB에 값 반영을 진행합니다.
			this.db.insert(preUpdateData, (error, insertedData)=>{
				if(error != null){
					if(typeof callback == 'function') callback(false,this.index)
					return
				}
				let id = insertedData._id

				// JSON INDEX 에도 KEY값을 저장합니다.
				if(typeof(innerObj[paramKeyParse[i]]) == 'undefined'){

					// 아예 키가 없는 경우 키를 새로 생성합니다.
					// 이 코드가 최종적인 this.index의 반영 부분입니다.
					innerObj[paramKeyParse[i]] = {_id:id}
				}else{

					// 아래 코드가 실제 메모리 상 경로를 생성합니다.
					// innerObj[paramKeyParse[i]]로도
					// 해당 코드와 동일하게 접근할 수 있습니다.
					if(typeof innerObj[paramKeyParse[i]] != 'object')
						innerObj[paramKeyParse[i]] = {}
					innerObj[paramKeyParse[i]]._id = id

				}

				// 키 값을 메모리 상의 인덱스에서 불러오기
				let key = innerObj[paramKeyParse[i]]
				if(typeof callback == 'function') callback(true)

				return
			})
		})
		return this
	}

	/**
	 * @description
	 * DB에 특정 키에 해당하는 값을
	 * 찾아서 DB에서 삭제하는 함수입니다.
	 *
	 * @param {string} paramKey
	 *    키는 파일을 담아놓는폴더처럼
	 *    nested 형태의 구조를 허용합니다.
	 *
	 *    자바의 네임스페이스 구조처럼
	 *    'hm.pw.num' 와 같은 키값을 사용가능합니다.
	 *
	 *    해당 키값의 인덱스 저장형태는 hm : { pw: '' } 와 같습니다.
	 *
	 * @param {function} superCallback
	 *    superCallback(isSuccess, unsettedCount)
	 */
	unset(paramKey, callback){
		let self = this
		self.process((isSuccess)=>{
			if(!isSuccess){
				if(typeof callback == 'function')
					callback(false)
				self.resolve()
				return
			}
			self._unset(paramKey, function innerToss(){
				if(typeof callback == 'function')
					callback(...arguments)
				self.resolve()
			})
		})
		return this
	}

	_unset(paramKey, superCallback){
		let paramKeyParse = paramKey.split('.')

		// 클로저 내부에서 인스턴스 접근용
		let self = this

		this.parseNamespace(paramKeyParse, [], this.index, 0, false, (prePath, allObj, i)=>{

			// 삭제할 대상 키
			let targetkey = paramKeyParse[paramKeyParse.length-1]

			// nestedUnsetter가 들어간 깊이
			let depth = 0
			
			// 총 삭제한 개수
			let totalNum = 0
			
			/**
			 * @description
			 * DB와 인덱스메모리 상에서
			 * 특정 키에 해당하는 값들을
			 * 찾아서 삭제하는 함수입니다.
			 *
			 * (클로저 이용을 위해 익명함수처리함)
			 *
			 * @param {string} prePath
			 *    상위 경로를 의미합니다.
			 *
			 * @param {string} preKey
			 *    상위 키 값을 의미합니다.
			 *
			 * @param {string} path
			 *    현재 작업 중인 경로를 의미합니다.
			 *
			 * @param {number} depth
			 *    얼마나 재귀되었는지를 나타냅니다.
			 *    (주로 디버깅용으로 사용됩니다.)
			 * 
			 * @param {number} totalNum
			 *    총 제거한 갯수를 의미합니다.
			 */
			let innerDBItemRemoveRemainCount = 0
			let nestedUnsetter = (prePath, preKey, path, callback) => {

				depth++
				let sendPrePath = path

				//경로가 아예 존재하지 않는 경우
				if(typeof path === 'undefined'){
					throw new Error(`Metada can't be read undefined path`)

					// 이후 값은 모두 무시하고 최상위로 올라갑니다.
					return 'error'
				}

				// 경로가 곧 주소인 경우
				if(typeof path === 'string'){
					if(typeof callback == 'function')
						callback('string',0)

					// 이후 값은 모두 무시하고 최상위로 올라갑니다.
					return 'end'
				}

				// 해당 경로 안을 전부 지워서 아무 것도 남지 않은 경우
				if(Object.keys(path).length === 0){
					depth--
					if(typeof callback == 'function')
						callback(null, 0)
					return 'object'
				}

				// for문 시작 해당 경로안에 있는 것들을 분석후 제거
				let isObject = false
				for(let key in path){

					// 안에 _id가 들어있는 경우
					if(typeof path[key] === 'string'){
						innerDBItemRemoveRemainCount++
						totalNum++
						depth--
						
						isObject = true

						self.db.remove({_id:path[key]},(error,numRemoved)=>{
							--innerDBItemRemoveRemainCount
							if(depth === 0 && (innerDBItemRemoveRemainCount == 0)){
								if(typeof callback == 'function')
									callback(null,numRemoved)
								return 'end'
							}
						})
					}

					// 경로 중간을 지정해서 안에 여전히 객체가 있는 경우
					if(typeof path[key] === 'object'){

						// lastId 분석
						let lastId = nestedUnsetter(sendPrePath, key, path[key], callback)

						switch(lastId){
						case 'remove':
							prePath[preKey] = omit(path,key)
							continue
							break
						case 'object':
							continue
							break

						// 에러인 경우 나머지 모든 부분을 무시하고 반환
						case 'error':
							if(depth === 1){
								if(typeof callback == 'function')
									callback('error',0)
								return 'error'
							}else{
								return 'error'
							}
							break

						// 콜백이 완료된 후 이후 코드가
						// 진행되지 못하게 하기 위함입니다.
						case 'end':	
							return 'end'
							break

						default:
							//return 'object'
							throw new Error(`Metada can't be founded any available key objects`)
							break
						}

						return 'error'
					}

					//throw new Error(`Metada can't be founded any available key objects`)
					//return 'error'
				}
				if(isObject) return 'object'

				if(depth === 0||depth === 1){

					// 최종결과를 여기서 반환합니다.
					if(typeof callback == 'function')
						callback(null, totalNum)
					return 'end'
				}else{
					// 남은 객체가 없는 경우
					if(Object.keys(prePath[preKey]).length === 0){
						depth--
						return 'object'
					}

					// 안에 다른 키가 남아 있는 경우
					depth--
				}
			}
			
			// 아예 해당 키가 존재하지 않으면
			if(typeof prePath[targetkey] == 'undefined'){
				if(typeof superCallback == 'function')
					superCallback(false, 0)
				return
			}

			nestedUnsetter(prePath, targetkey, prePath[targetkey], (error, numUnsetted)=>{

				// 바로 값을 찾은 경우
				if(error === 'string'){
					self.db.remove({_id:prePath._id},(error, numRemoved)=>{
						
						// 에러 없으며 1개만 삭제한 경우
						if(typeof superCallback == 'function')
							superCallback(true, 1)
					})
					return
				}
				
				// 중간 위치를 입력한 경우
				if(error === null){
					
					let forSaveObj = allObj[allObj.length-1]
					
					// 대상 키값 밑에 있는 데이터는 모두 삭제합니다.
					delete forSaveObj[paramKeyParse[paramKeyParse.length-1]]
					
					// 부모키가 비어있으면 하나씩 올라가며 삭제
					if(paramKeyParse.length > 1){
						for(let innerEmptyParamKeyIndex = paramKeyParse.length-2;
						   innerEmptyParamKeyIndex>0;innerEmptyParamKeyIndex--){

							let innerEmptyParamKey = ''
							let innerEmptyParamKeys = []
							for(let innerRebuildParamKeyIndex = 0;
							   innerRebuildParamKeyIndex <= innerEmptyParamKeyIndex;
							   innerRebuildParamKeyIndex++){

								innerEmptyParamKey += ((innerRebuildParamKeyIndex != 0) ? '.' : '') + paramKeyParse[innerRebuildParamKeyIndex]
								innerEmptyParamKeys.push(innerEmptyParamKey)
							}
							
							innerEmptyParamKeys.reverse()
							for(let innerEmptyParamKeysIndex of innerEmptyParamKeys){
								let emptyCheckValue = self.getByPath(self.index, innerEmptyParamKeysIndex)
								let emptyCheckValueLength = -1
								if(typeof emptyCheckValue == 'object')
									emptyCheckValueLength = Object.keys(emptyCheckValue).length

								if(emptyCheckValueLength === 0)
									self.deleteByPath(self.index, innerEmptyParamKeysIndex)
							}
						}
					}else{
						delete self.index[paramKey]
					}
					
					if(typeof superCallback == 'function')
						superCallback(true, totalNum)
					return
				}
				// 오류를 반환합니다.
				if(typeof superCallback == 'function')
					superCallback(false, 0)
				
			}, 0, totalNum)
		})
		return this
	}

	/**
	 *
	 * @param {string} paramKey
	 *
	 * @param {function} callback
	 *    callback(isExist, dataCount)
	 */
	exist(paramKey, callback){
		let self = this
		self.process((isSuccess)=>{
			if(!isSuccess){
				if(typeof callback == 'function')
					callback(false)
				self.resolve()
				return
			}
			self._exist(paramKey, function innerToss(){
				if(typeof callback == 'function')
					callback(...arguments)
				self.resolve()
			})
		})
		return this
	}

	_exist(paramKey,callback){
		let paramKeyParse = paramKey.split('.')
		
		// 클로저 내부에서 인스턴스 접근용
		let self = this

		self.parseNamespace(paramKeyParse,[], self.index, 0, false, (innerObj, preObj, i)=>{
			let readId = null

			// 해당 주소가 존재하지 않는 경우
			if(typeof innerObj[paramKeyParse[i]] === 'undefined'){
				if(typeof callback == 'function')
					callback(false, 0)
				return
			}

			// 안에 주소가 들어있지 않은 경우
			if(typeof innerObj[paramKeyParse[i]]._id !== 'string'){
				if(typeof callback == 'function')
					callback(false, 0)
				return
			}

			// 안에 주소가 들어있어서 읽어오는 경우
			readId = innerObj[paramKeyParse[i]]._id

			self.db.count({_id: readId},(error,count)=>{
				switch(count){
					// 존재하지 않는 경우
					case 0:
						if(typeof callback == 'function')
							callback(false, count)
						break
					// 1개 이상 존재하는 경우
					default :
						if(typeof callback == 'function')
							callback(true, count)
						break
				}
			})
		})
		return this
	}
	
	getByString(o, s) {
		// Convert indexes to properties
		s = s.replace(/\[(\w+)\]/g, '.$1')

		// Strip a leading dot
		s = s.replace(/^\./, '')

		let a = s.split('.')

		for (let i = 0, n = a.length; i < n; ++i) {
			let k = a[i]

			if (k in o)
				o = o[k]
			else
				return
		}
		return o
	}

	/**
	 *
	 * @param {string} paramKey
	 *
	 * @param {function} callback
	 *    callback(isSuccess, count)
	 */
	count(paramKey, callback){
		let self = this
		self.process((isSuccess)=>{
			if(!isSuccess){
				if(typeof callback == 'function')
					callback(false, null)
				self.resolve()
				return
			}
			
			let data = self.getByString(self.index, paramKey)
			let dataCount = ((data !== null && data !== undefined) ? Object.keys(data).length : 0)

			if(typeof data == 'object'){
				if(typeof data['_latest'] != 'undefined')
					dataCount -= 1
				if(typeof data['_id'] != 'undefined')
					dataCount -= 1
			}

			callback(true, dataCount)
			self.resolve()
		})
		return this
	}

	/**
	 * @description
	 * nedb를 램에서 내리고
	 * 인덱스를 저장하는 함수입니다.
	 *
	 * @param {function} callback
	 *    callback(isUnloaded)
	 */
	unload(callback){
		let self = this
		self.process((isSuccess)=>{
			if(!isSuccess){
				if(typeof callback == 'function')
					callback(false)
				self.resolve()
				return
			}
			self._unload(function innerToss(){
				if(typeof callback == 'function')
					callback(...arguments)
				self.resolve()
			})
		}, 'unload', false)
		return this
	}

	_unload(callback){
		if(!this.isLoaded){
			if(typeof callback == 'function')
				callback(true)
			return
		}

		if(this.selfGC != null)
			clearInterval(this.selfGC)
		this.saveIndex()

		delete this.db
		delete this.index
		this.isLoaded = false

		if(typeof callback == 'function')
			callback(true)
		return this
	}

	/**
	 * @param {function} callback
	 *    callback(isSuccess, self)
	 */
	reload(callback){
		var self = this
		self.process((isSuccess)=>{
			if(!isSuccess){
				if(typeof callback == 'function')
					callback(false)
				self.resolve()
				return
			}
			self._reload(function innerToss(){
				if(typeof callback == 'function')
					callback(...arguments)
				self.resolve()
			})
		}, 'reload', false)
		return this
	}

	_reload(callback, isInit){
		var self = this

		if(self.isClosed){
			callback(false, null)
			return
		}

		if(self.isLoaded){
			if(typeof callback == 'function')
				callback(true, self)
			return
		}

		// DB가 완전히 불려와진 상태인지 확인용
		self.isLoaded = false

		// DB가 안열려 있으므로 DB 생성
		self.db = new Datastore({
			filename: self.fullPath,
			autoload : false
		})

		// 목록에 추가
		isOpenedFiles[self.fullPath] = self

		self.db.loadDatabase( (error) => {
			//인덱스 불러오기 또는 생성하기
			if(!fs.existsSync(self.indexPath)){
				mkdirp(self.folderPath, (err)=>{
					fs.writeFileSync(self.indexPath, JSON.stringify({}), 'utf-8')
				})
			}

			// JSON 인덱스 정보를 불러옴
			try{
				self.index = JSON.parse(fs.readFileSync(self.indexPath, 'utf-8'))
			}catch(error){
				self.index = {}
			}

			self.isLoaded = true
			self.isClosed = false

			// 모두 정상적으로 완료되었을때 나오는 콜백
			// 활성화 상태로 만들기
			if(typeof callback == 'function')
				callback(true, self)

			if(isInit && self.isIDLE && self.commandQueue.length > 0){
				// 실행이 다 되었을 때
				// 그다음 명령어 큐가 있으면 실행시켜주기
				self.resolve()
			}
		})

		// 서버 종료시 자동 저장
		if(typeof global['dispatcher'] != 'undefined'){
			global.dispatcher.on('shutdown', ()=>{
				self._unload()
			}, 4)
		}else{
			process.on('exit', ()=>{
				self._unload()
			})
		}

		// 자체 GC 구현
		self.maxWaitTimeGC = 5000 // 5분 1000*60*5
		self.lastGCTime = (new Date()).getTime()
		
		// 1초마다 검사합니다.
		/*
		self.selfGC = setInterval(()=>{
			let currentTime = (new Date()).getTime()

			if((currentTime - self.lastGCTime)>= self.maxWaitTimeGC){
				self._unload()

				if(self.selfGC != null)
					clearInterval(self.selfGC)
			}
		}, 1000)
		*/

		return this
	}

	close(callback){
		this.process((isSuccess)=>{
			if(!isSuccess){
				if(typeof callback == 'function')
					callback(false)
				return
			}
			this._close(callback)
		})
		return this
	}

	_close(callback){

		// 여러 곳에서 호출되고 있는 경우
		// 호출된 모든 곳에서 닫힐 때까지
		// 해당 인스턴스를 닫지 않고 유지합니다.
		this.initCount--
		if(this.initCount > 0){
			if(typeof callback == 'function')
				callback(true)
			return
		}

		// 아직 로딩되어 있으면 언로드처리
		if(this.isLoaded){
			this._unload(()=>{this._close(callback)})
			return
		}

		// 이미 닫혀 있을 경우 그냥 반환
		if(this.isClosed){
			if(typeof callback == 'function')
				callback(true)
			return
		}

		if(typeof isOpenedFiles[this.fullPath] != 'undefined')
			delete isOpenedFiles[this.fullPath]

		this.isClosed = true

		if(typeof callback == 'function')
			callback(true)
		return null
	}

	// 실행이 다 되었을 때
	// 그다음 명령어 큐가 있으면 실행시켜주기
	resolve () {
		let nextCommand = this.commandQueue.shift()
		if(typeof nextCommand == 'function'){
			nextCommand(this, ()=>{this.resolve()})
			return this
		}
		this.isIDLE = true
	}

	/**
	 * @description
	 * CRUD 명령함수들 내부에서
	 * 동시에 실행되는 상황 방지용 처리함수
	 */
	process(callback, type, isEmergency = false){
		if(typeof callback != 'function')
			return this
		
		let self = this

		// 이미 DB 핸들이 닫힌경우
		// 처리 안 하므로 반환
		if(typeof isOpenedFiles[self.fullPath] == 'undefined' 
			|| self.isClosed){
			callback(false)
			return this
		}

		// 만약 언로드 상태에서 다른 명령이 들어온 경우
		// 해당 명령어 사용을 위해서 리로드 후 명령 진행
		if(!self.isLoaded && type != 'unload' && type != 'reload'){
			self._reload(callback)
			return
		}
	
		let innerWork = () => {
			// 이미 DB 핸들이 닫힌경우
			// 처리 안 하므로 반환
			if(typeof isOpenedFiles[self.fullPath] == 'undefined' 
			  	|| self.isClosed){
				callback(false)
				return
			}

			// 만약 언로드 상태에서 다른 명령이 들어온 경우
			// 해당 명령어 사용을 위해서 리로드 후 명령 진행
			if(!self.isLoaded && type != 'unload' && type != 'reload'){
				self._reload(callback)
				return
			}
			callback(true)
		}

		// GC 시간갱신
		this.lastGCTime = (new Date()).getTime()

		// 현재 작업 중인 명령이 존재할 경우
		// 명령큐에 미뤄놓기
		if(!this.isLoaded || !this.isIDLE){

			if(isEmergency)
				this.commandQueue.unshift(innerWork)
			else
				this.commandQueue.push(innerWork)
			return this
		}

		// 현재 작업 중인 명령이 없을 경우
		// 해당 명령어 바로 실행
		this.isIDLE = false
		innerWork()
		
		return this
	}

	/**
	 * @description
	 * 인덱스 저장 함수
	 */
	saveIndex(){
		fs.writeFileSync(this.indexPath, JSON.stringify(this.index, null, 3), 'utf-8')
		return this
	}

	/**
	 * @description
	 * NEDB에 저장되는 데이터들은
	 * 빠른 저장을 위해 바뀐 이력을 모두 남깁니다.
	 *
	 * 그러므로 변경이력이 많이 쌓인 시점에서는
	 * optimize 함수를 적절히 사용해야합니다.
	 */
	optimize(callback){
		let self =this
		self.process((isSuccess)=>{
			if(!isSuccess){
				if(typeof callback == 'function')
					callback(false)
				self.resolve()
				return
			}
			self._optimize(callback)
			self.resolve()
		})
		return this
	}

	_optimize(callback){
		this.db.persistence.compactDatafile()
		if(typeof callback == 'function')
			callback(false)
		return this
	}

	/**
	 * @description
	 * 다층 객체를 만드는데 사용하는 함수입니다.
	 *
	 * @param {string}
	 *    paramKeyParse 는
	 *    hm.age.num 같은 키 값을 담습니다.
	 *
	 * @param {object} parentObject
	 *    함수내부에서 또는 외부에서 쓰기위해
	 *    만든 한단계 이전의, 즉 상위의 객체입니다.
	 *    (ex A:{B:1} 이면 B가 현재 paramObj이고, A가 preObj)
	 *
	 * @param {object} childObject
	 *    paramObj는 맨처음에 입력받은 객체입니다.
	 *   
	 * @param {number} loopStage
	 *    키값에서 몇번쨰 단계인지를 나타냄
	 */
	parseNamespace(paramKeyParse, parentObject, childObject, loopStage, isSetter, callback){
		// innerObj는 키값에 따라
		// 내려온 모든 경로를 담고있는 배열
		let innerObj = childObject
		parentObject.push(innerObj)

		// 키값이 끝날때까지 반복
		// 여기서부터 경로를 반환합니다.
		if(loopStage >= paramKeyParse.length-1){

			// 다 끝난경우 콜백으로 반환
			if(typeof callback == 'function')
				callback(innerObj, parentObject, loopStage)
			return
		}

		// 여기서부터 경로생성을 진행합니다.
		let key = paramKeyParse[loopStage]

		// 만일 기존에 존재하지 않는 경로로 가면 생성해서 진행
		if(typeof innerObj[key] === 'undefined'){
			if(!isSetter){

				// 다 끝난경우 콜백으로 반환
				if(typeof callback == 'function')
					callback(innerObj, parentObject, loopStage)
				return
			}
			innerObj[key] = {}
		}

		let nextObj =  innerObj[key]

		// 탐색을 완료할 때까지 재귀를 반복합니다.
		return this.parseNamespace(paramKeyParse, parentObject, nextObj, ++loopStage, isSetter, callback)
	}
	
	setByPath(obj, path, value) {
		let parts = path.split('.')
		return parts.reduce((prev, curr, ix)=>{
			return (ix + 1 == parts.length)
			? prev[curr] = value
			: prev[curr] = prev[curr] || {}
		}, obj)
	}

	getByPath(obj, value) {
		let innerValue = value.replace(/\[(\w+)\]/g, '.$1')
		innerValue = innerValue.replace(/^\./, '')
		let a = innerValue.split('.')
		for (let i = 0, n = a.length; i < n; ++i) {
			let k = a[i]
			if (k in obj) 
				obj = obj[k]
			else
				return
		}
		return obj
	}

	// https://github.com/miktam/key-del
	deleteByPath(finalObject, elem){
		let map = (array, iteratee) => {
		  let index = -1
		  const length = array == null ? 0 : array.length
		  const result = new Array(length)

		  while (++index < length) {
			result[index] = iteratee(array[index], index, array)
		  }
		  return result
		}

		for(let prop in finalObject) {
			if(!finalObject.hasOwnProperty(prop))
				continue

			if (elem === prop) {

				// Simple key to delete
				delete finalObject[prop]

			} else if (elem.indexOf('.') != -1) {

				let parts = elem.split('.')
				let pathWithoutLastEl
				let lastAttribute

				if (parts && parts.length === 2) {
					lastAttribute = parts[1]
					pathWithoutLastEl = parts[0]

					let nestedObjectRef = finalObject[pathWithoutLastEl]
					if (nestedObjectRef) 
						delete nestedObjectRef[lastAttribute]

				} else if (parts && parts.length === 3) {

					// Last attribute is the last part of the parts
					lastAttribute = parts[2]
					let deepestRef = (finalObject[parts[0]])[parts[1]]
					delete deepestRef[lastAttribute]

				} else throw new Error("Nested level " + parts.length + " is not supported yet")

			}else {

				if (finalObject[prop] != null
					&& (typeof finalObject[prop] == 'object'
						|| typeof finalObject[prop] == 'function')) {

					if(finalObject[prop] != null && typeof finalObject[prop] != 'function' &&
					   (finalObject[prop].length == 'number'
						&& finalObject[prop].length > -1
						&& finalObject[prop].length % 1 == 0 
						&& finalObject[prop].length <= MAX_SAFE_INTEGER)) {

						finalObject[prop] = map(finalObject[prop], (obj) => {
							return this.deleteByPath(obj, elem)
						})
					} else {
						finalObject[prop] = this.deleteByPath(finalObject[prop], elem)
					}
				}
			}
		}
		return finalObject
	}
}