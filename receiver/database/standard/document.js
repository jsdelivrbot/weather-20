export default class Document{
	constructor(standard, collectionId, accountCollectionId, channelCollectionId){
		this.standard = standard
		this.metadata = standard.metadata

		this.collectionId = collectionId
		this.accountCollectionId = accountCollectionId
		this.channelCollectionId = channelCollectionId
	}

	/**
	 * @param {object} data
	 * @param {function} callback
	 * @param {string} accountId
	 * @param {string} channelId
	 *    callback(isSuccess, documentId)
	 */
	write(data, callback, accountId, channelId){
		let self = this

		// document.* 형태로 문서를 등록 합니다.
		self.metadata.process((isSuccess)=>{

			// 잘못된 정보 입력 시도시 입력 없이 반환처리 합니다.
			if(self.checkWrongSchema(data)
			   || !self.isValidId(accountId)
			   || !self.isValidId(channelId)){

				if(typeof callback == 'function')
					callback(false, null)
				self.metadata.resolve()
				return
			}

			// 작성자명 & 채널명 정보를 추가합니다.
			data['account'] = accountId
			data['channel'] = channelId

			self.metadata._create(`${self.collectionId}`, data, (isSuccess, documentId)=>{

				// 처리에 실패했거나 account 연관정보를
				// 등록할 필요가 없는 경우 반환합니다.
				if(!isSuccess || (accountId === null || accountId === undefined)
					|| typeof data != 'object'){

					if(typeof callback == 'function')
						callback(isSuccess, documentId)
					self.metadata.resolve()
					return
				}

				let changedData = data
				changedData['_id'] = `${self.collectionId}.${documentId}`

				let needToCreateIsSuccess = true
				let needToCreateNum = 0
				if(accountId !== undefined && accountId !== null)
					needToCreateNum++
				if(channelId !== undefined && channelId !== null)
					needToCreateNum++
				
				let needToCreateFinisher = (isSuccess)=>{
					if(!isSuccess) needToCreateIsSuccess = isSuccess

					// 마지막 처리가 아니면 삭제합니다.
					if((--needToCreateNum) != 0) return

					// 연관관계 등록에 실패한 경우 반환합니다.
					if(!needToCreateIsSuccess){
						if(typeof callback == 'function')
							callback(needToCreateIsSuccess, documentId)
						self.metadata.resolve()
						return
					}
					
					// account.* 연관관계 정보를
					// document.* 형태의 문서에 저장합니다.
					self.metadata._update(`${self.collectionId}`, documentId, changedData, (isSuccess)=>{
						if(typeof callback == 'function')
							callback(isSuccess, documentId)
						self.metadata.resolve()
					})
				}
				
				let needToCreateProcessor = (innerCollectionId, innerItemId, typeName)=>{
					if(innerItemId !== undefined && innerItemId !== null){
						self.metadata._create(`${innerCollectionId}.${innerItemId}`, documentId, (isSuccess, relativeNum)=>{

							// 연관관계 등록에 실패한 경우 반환합니다.
							if(!isSuccess){
								needToCreateFinisher(false)
								self.metadata.resolve()
								return
							}

							// 해당 연관정보를 document 자료에도 반영합니다.
							changedData[typeName] = `${innerCollectionId}.${innerItemId}.${relativeNum}`

							needToCreateFinisher(true)
						})
					}
				}

				// account.*.* 형태로 자신이 쓴 문서목록을 만듭니다.
				needToCreateProcessor(self.accountCollectionId, accountId, '_account')
				
				// channel.*.* 형태로 자신이 쓴 문서목록을 만듭니다.
				needToCreateProcessor(self.channelCollectionId, channelId, '_channel')
			})
		})
	}

	/**
	 * @param {string} documentId
	 * @param {function} callback
	 *    callback(isExist)
	 */
	exist(documentId, callback){
		this.metadata.check(`${this.collectionId}`, documentId, callback)
	}

	/**
	 * @param {string} documentId
	 * @param {function} callback
	 *    callback(isSuccess, documentSchema)
	 */
	read(documentId, callback){
		this.metadata.read(`${this.collectionId}`, documentId, callback)
	}

	/**
	 * @param {string} userId
	 * @param {object} data
	 * @param {function} callback
	 *    callback(isSuccess)
	 */
	update(documentId, data, callback, accountId=null, channelId=null){
		let self = this

		self.metadata.process((isSuccess)=>{

			// 삭제하기 전 해당 게시글이 만든
			// 연관관계를 삭제하기 위해서 게시글을 읽어옵니다.
			self.metadata._read(`${self.collectionId}`, documentId, (isSuccess, documentSchema)=>{

				// 이전 게시글을 읽어오는데 실패하면 반환
				if(!isSuccess || typeof documentSchema != 'object'
				  || documentSchema === undefined
				  || documentSchema === null
				  || typeof documentSchema['account'] === 'undefined'
				  || typeof documentSchema['channel'] === 'undefined'
				  || (accountId != null && documentSchema['account'] !== accountId)
				  || (channelId != null && documentSchema['channel'] !== channelId)){

					callback(false)
					self.metadata.resolve()
					return
				}

				self.metadata._update(`${self.collectionId}`, documentId, data, callback)
				self.metadata.resolve()
			})
		})
	}

	/**
	 * @param {string} documentId
	 *
	 * @param {function} changeCallback
	 *    changeCallback(data)
	 *
	 * @param {function} statusCallback
	 *    statusCallback(isSuccess)
	 *
	 * @param {string} accountId
	 * @param {string} channelId
	 */
	change(documentId, changeCallback, statusCallback, accountId=null, channelId=null){
		let self = this
		self.metadata.change(`${self.collectionId}.${documentId}`, (isSuccess, data, status)=>{
			if(!isSuccess || data === null || data === undefined
				|| typeof data != 'object'
				|| typeof data['account'] === 'undefined'
				|| typeof data['channel'] === 'undefined'
			  	|| accountId !== null && (data['account'] != accountId)
			  	|| channelId !== null && (data['channel'] != channelId)){

				if(typeof statusCallback === 'function')
					statusCallback(false)
				return
			}
			
			let changedData = null
			if(typeof changeCallback === 'function')
				changedData = changeCallback(data)

			if(changedData === null) return

			return {
				act: 'set',
				data: changedData
			}
		}, (isSuccess, resolve)=>{
			if(typeof statusCallback === 'function') statusCallback(isSuccess)
			if(typeof resolve === 'function') resolve()
		})
	}
	

	/**
	 * @param {string} documentId
	 * @param {function} callback
	 *    callback(isSuccess)
	 */
	delete(documentId, callback, accountId=null, channelId=null){
		let self = this

		self.metadata.process((isSuccess)=>{

			// 삭제하기 전 해당 게시글이 만든
			// 연관관계를 삭제하기 위해서 게시글을 읽어옵니다.
			self.metadata._read(`${self.collectionId}`, documentId, (isSuccess, documentSchema)=>{

				// 이전 게시글을 읽어오는데 실패하면 반환
				if(!isSuccess || typeof documentSchema != 'object'
				  || documentSchema === undefined
				  || documentSchema === null
				  || typeof documentSchema['account'] === 'undefined'
				  || typeof documentSchema['channel'] === 'undefined'
				  || (accountId !== null && documentSchema['account'] !== accountId)
				  || (channelId !== null && documentSchema['channel'] !== channelId)){

					callback(false)
					self.metadata.resolve()
					return
				}

				let deleteCount = 0
				let isDeleteSuccess = true

				if(typeof documentSchema['_comment'] != 'undefined')
					deleteCount++
				if(typeof documentSchema['_account'] != 'undefined')
					deleteCount++
				
				let deleteResolve = (isSuccess)=>{
					--deleteCount
					if(isDeleteSuccess) isDeleteSuccess = isSuccess
					if(deleteCount != 0) return

					// 여기에서 실제 해당 게시글 삭제시도
					self.metadata._delete(`${self.collectionId}`, documentId, (isSuccess)=>{
						callback(isSuccess)
						self.metadata.resolve()
					})
				}

				// 연관관계 삭제함수
				let innerRelativeDelete = (paramKey)=>{
					if(typeof documentSchema[paramKey] != 'undefined'){

						let realKey = ''
						let realKeyIndex = ''
						let realKeyParse = documentSchema[paramKey].split('.')

						if(realKeyParse.length <= 1){
							realKey = documentSchema[paramKey]
							realKeyIndex = null
						}else{
							for(let realKeyParseIndex in realKeyParse){
								if(realKeyParseIndex == (realKeyParse.length-1)){
									realKeyIndex = realKeyParse[realKeyParseIndex]
									continue
								}
								realKey += ((realKeyParseIndex == 0)? '' : '.') + realKeyParse[realKeyParseIndex]
							}
						}

						self.metadata._delete(realKey, realKeyIndex, (isSuccess, unsettedCount)=>{

							// _* 연관관계 삭제에 실패하면 false 처리
							if(!isSuccess || typeof documentSchema != 'object'){
								deleteResolve(false)
								return
							}
							deleteResolve(true)
						})
					}
				}

				// _comment 연관관계 삭제
				innerRelativeDelete('_comment')

				// _account 연관관계 삭제
				innerRelativeDelete('_account')
				   
				// _channel 연관관계 삭제
				innerRelativeDelete('_channel')
			})
		})
	}

	/**
	 * @description
	 *
	 * @param {object} schema
	 * @return {boolean}
	 */
	checkWrongSchema(schema){

		if(typeof schema != 'object')
			return true

		if(typeof schema['context'] !== 'string')
			return true
		
		// 10000자가 넘어가면 반환처리
		if(schema['context'].length >= 10000)
			return true

		if(typeof schema['timestamp'] === 'number')
			schema['timestamp'] = String(schema['timestamp'])

		if(typeof schema['timestamp'] !== 'string')
			return true

		return false
	}

	/**
	 * @description
	 *
	 * @param {string} id
	 * @return {boolean}
	 */
	isValidId(id){
		return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(id)
	}
}