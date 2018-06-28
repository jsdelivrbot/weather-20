import Identification from './identification.js'

export default class Collection extends Identification{
	constructor(standard, collectionId, documentCollectionId){
		super(standard, collectionId, documentCollectionId)
	}

	/**
	 * @param {string} dataType
	 * @param {string} channelId
	 * @param {string} accountId
	 * @param {function} callback
	 *    callback(isSuccess, status)
	 */
	addProperty(dataType, channelId, accountId, callback, autoInit = false){
		let self = this
		self.metadata.change(`${self.collectionId}.${channelId}`, 
			(isSuccess, data, status)=>{

				// 만약 아직 생성되지 않은 콜렉션이라면 반환
				if(!autoInit && ( !isSuccess
					|| data === undefined 
					|| data === null
					|| typeof data != 'object')){

					if(typeof callback === 'function')
						callback(false, 'Not exist collection')
					return
				}

				if(autoInit && (data === undefined 
					|| data === null
					|| typeof data != 'object'))
					data = {}

				// 만약 manager 옵션이
				// 정의되어 있지 않은 경우 초기화
				if(typeof data[dataType] != 'object')
					data[dataType] = []

				// 만약 이미 추가가 되어 있다면 반환
				if(data[dataType].indexOf(accountId) !== -1){
					if(typeof callback === 'function')
						callback(false, 'Already Added')
					return
				}

				// 콜렉션 아이템 추가
				data[dataType].push(accountId)

				return {
					act: 'set',
					data: data
				}
			},(isSuccess, resolve)=>{
			
				// 업데이트에 실패한 경우
				if(!isSuccess){

					if(typeof callback === 'function')
						callback(false, 'Update failed')
					self.metadata.resolve()
					return
				}

				if(typeof callback === 'function')
					callback(true, 'Success')
				self.metadata.resolve()
			}
		)
	}

	/**
	 * @param {string} dataType
	 * @param {string} channelId
	 * @param {string} accountId
	 * @param {function} callback
	 *    callback(isSuccess, status)
	 */
	deleteProperty(dataType, channelId, accountId, callback){
		let self = this
		self.metadata.change(`${self.collectionId}.${channelId}`, 
			(isSuccess, data, status)=>{

				// 만약 아직 생성되지 않은 콜렉션이라면 반환
				if(!isSuccess
					|| data === undefined 
					|| data === null
					|| typeof data != 'object'){

					if(typeof callback === 'function')
						callback(false, 'Not exist collection')
					return
				}

				// 만약 manager 옵션이
				// 정의되어 있지 않은 경우 초기화
				if(typeof data[dataType] != 'object')
					data[dataType] = []

				// 만약 이미 삭제가 되어 있다면 반환
				let itemIndex = data[dataType].indexOf(accountId)
				if(itemIndex === -1){
					if(typeof callback === 'function')
						callback(false, 'Already Removed')
					return
				}

				// 콜렉션 아이템 삭제
				data[dataType].splice(itemIndex, 1)
			
				let isEmptyProperty = true
				for(let dataIndex in data){
					if(typeof data[dataIndex]['length'] != 'undefined'
						&& data[dataIndex].length != 0){

						isEmptyProperty = false
						break
					}
				}

				return (isEmptyProperty) ? { act: 'unset' } : {
					act: 'set',
					data: data
				}
			},(isSuccess, resolve)=>{
			
				// 업데이트에 실패한 경우
				if(!isSuccess){

					if(typeof callback === 'function')
						callback(false, 'Update failed')
					self.metadata.resolve()
					return
				}

				if(typeof callback === 'function')
					callback(true, 'Success')
				self.metadata.resolve()
			}
		)
	}

	/**
	 * @param {string} dataType
	 * @param {string} channelId
	 * @param {string} accountId
	 * @param {function} callback
	 *    callback(isInnerProperty)
	 */
	isInnerProperty(dataType, channelId, accountId, callback){
		let self = this

		// 일단 읽어옵니다.
		self.metadata.process((isSuccess)=>{
			if(!isSuccess){
				if(typeof callback === 'function')
					callback(false)
				self.metadata.resolve()
				return
			}

			self._isInnerProperty(dataType, channelId, accountId, callback, ()=>{self.metadata.resolve()})
		})
	}
	_isInnerProperty(dataType, channelId, accountId, callback, resolve){
		let self = this

		// 일단 읽어옵니다.
		self.metadata._get(`${self.collectionId}.${channelId}`, (isSuccess, data, status)=>{

			// 정보를 읽는데 실패한 경우
			if(!isSuccess
			    || data === undefined
				|| data === null
				|| typeof data != 'object'
				|| typeof data[dataType] != 'object'){

				if(typeof callback === 'function')
					callback(false)
				if(typeof resolve === 'function')
					resolve()
				return
			}

			// 콜렉션 내에 속해있는지 확인
			let itemIndex = data[dataType].indexOf(accountId)

			// 속해있지 않은지 여부 확인전달
			if(typeof callback === 'function')
				callback(itemIndex !== -1)
			if(typeof resolve === 'function')
				resolve()
		})
	}
	

	/**
	 * @param {string} dataType
	 * @param {string} channelId
	 * @param {function} callback
	 *    callback(isSuccess, countNum)
	 */
	countProperty(dataType, channelId, callback){
		let self = this

		// 일단 읽어옵니다.
		self.metadata.get(`${self.collectionId}.${channelId}`, (isSuccess, data, status)=>{

			// 정보를 읽는데 실패한 경우
			if(!isSuccess
			    || data === undefined
				|| data === null
				|| typeof data != 'object'
				|| typeof data[dataType] != 'object'){

				if(typeof callback === 'function')
					callback(isSuccess, 0)
				return
			}

			if(typeof callback === 'function')
				callback(true, data[dataType].length)
		})
	}
}