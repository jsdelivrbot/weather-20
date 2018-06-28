export default class Comment{
	constructor(standard, documentCollectionId, accountCollectionId, channelCollectionId){
		this.standard = standard
		this.metadata = standard.metadata

		this.documentCollectionId = documentCollectionId
		this.accountCollectionId = accountCollectionId
		this.channelCollectionId = channelCollectionId
	}

	/**
	 * @param {string} documentId
	 * @param {object} paramData
	 * @param {function} callback
	 * @param {string} accountId
	 *    callback(isSuccess, commentId, commentNum)
	 */
	write(documentId, paramData, callback, accountId, channelId){
		let self = this
		let document = self.standard.document

		// 일단 별개 도큐먼트로 등록합니다.
		self.metadata.process((isSuccess)=>{
		self.metadata._create(`${self.documentCollectionId}`, paramData, (isSuccess, commentId, resolve)=>{

			// 게시글 등록에 실패하면 반환합니다.
			if(!isSuccess){
				if(typeof callback == 'function')
					callback(isSuccess, null, null)
				if(typeof resolve == 'function')
					resolve()
				return
			}

			// 그 후 다른 연관관계로 id 값만 등록해줍니다.
			self.metadata._create(`${self.documentCollectionId}.${documentId}`, {commentId: commentId}, (isSuccess, commentNum, resolve)=>{

				// 게시글 연관관계 등록에 실패하면 반환합니다.
				if(!isSuccess){
					if(typeof callback == 'function')
						callback(isSuccess, commentId, null)
					if(typeof resolve == 'function')
						resolve()
					return
				}

				// account.* 형태로 자신이 쓴 문서목록을 만듭니다.
				self.metadata._create(`${self.accountCollectionId}.${accountId}`, {accountDocId: documentId}, (isSuccess, accountNum)=>{

					// 게시글 연관관계 등록에 실패하면 반환합니다.
					if(!isSuccess){
						if(typeof callback == 'function')
							callback(isSuccess, commentId, null)
						if(typeof resolve == 'function')
							resolve()
						return
					}

					if(typeof paramData === 'object'){
						let changedData = paramData

						// 연관관계 정보를 데이터에 내장합니다.
						changedData._id = `${self.documentCollectionId}.${commentId}`
						changedData._comment = `${self.documentCollectionId}.${documentId}.${commentNum}`
						changedData._account = `${self.accountCollectionId}.${accountId}.${accountNum}`
						changedData.account = accountId
						changedData.channel = channelId

						self.metadata._update(`${self.documentCollectionId}`, commentId, changedData, (isSuccess)=>{

							// 게시글 연관관계 내부객체 저장에 실패하면 반환합니다.
							if(!isSuccess){
								if(typeof callback == 'function')
									callback(isSuccess, commentId, null)
								if(typeof resolve == 'function')
									resolve()
								return
							}

							// 콜백이 있을 때만 반환합니다.
							if(typeof callback == 'function')
								callback(isSuccess, commentId, commentNum)
							if(typeof resolve == 'function')
								resolve()
						})
						return
					}

					// 콜백이 있을 때만 반환합니다.
					if(typeof callback == 'function')
						callback(isSuccess, commentId, commentNum)
					if(typeof resolve == 'function')
						resolve()
				})
			})
		}, ()=>{self.resolve()})
		})
	}

	/**
	 *
	 * @param {string} documentId
	 *
	 * @param {function} callback
	 *    callback(isSuccess, count)
	 */
	count(documentId, callback){
		this.metadata.count(`${this.documentCollectionId}.${documentId}`, callback)
	}

	/**
	 * @param {string} documentId
	 * @param {string} commentNum
	 * @param {function} callback
	 *    callback(isExist, documentCount)
	 */
	exist(documentId, commentNum, callback){
		this.metadata.check(`${this.documentCollectionId}.${documentId}`, commentNum, callback)
	}

	/**
	 * @param {string} documentId
	 * @param {string} commentNum
	 * @param {function} callback
	 *    callback(isSuccess, data)
	 */
	read(documentId, commentNum, callback){
		let self = this

		self.metadata.process((isSuccess)=>{
			if(!isSuccess){
				if(typeof callback == 'function')
					callback(isSuccess, null)
				if(typeof self.metadata.resolve == 'function')
					self.metadata.resolve()
				return
			}

			self.metadata._read(`${self.documentCollectionId}.${documentId}`, commentNum, (isSuccess, commentLinkData)=>{
				// commentId 가 존재하지 않는 경우 반환
				if(!isSuccess || commentLinkData === null
				   || commentLinkData === undefined
				   || typeof commentLinkData != 'object'
				   || typeof commentLinkData['commentId'] == 'undefined'){

					if(typeof callback == 'function')
						callback(false, null)
					if(typeof self.metadata.resolve == 'function')
						self.metadata.resolve()
					return
				}

				let commentId = commentLinkData['commentId']
				self.metadata._read(`${self.documentCollectionId}`, commentId, (isSuccess, commentData)=>{

					// commentId 가 존재하지 않는 경우 반환
					if(!isSuccess){
						if(typeof callback == 'function')
							callback(false, null)
						if(typeof self.metadata.resolve == 'function')
							self.metadata.resolve()
						return
					}

					if(typeof callback == 'function')
						callback(true, commentData)
					if(typeof self.metadata.resolve == 'function')
						self.metadata.resolve()
				})
			})
		})
		
	}

	/**
	 * @param {string} documentId
	 * @param {string} commentId
	 * @param {string} commentNum
	 * @param {function} callback
	 *    callback(isSuccess)
	 */
	delete(documentId, commentId, commentNum, callback, accountId=null, channelId=null){
		let self = this
		let document = self.standard.document

		// 해당 댓글 도큐먼트를 제거합니다.
		document.delete(commentId, (isSuccess)=>{
			if(!isSuccess){
				if(typeof callback == 'function')
					callback(isSuccess)
				return
			}

			// 그 후 연관관계 설정을 해제해줍니다.
			self.metadata.delete(`${self.documentCollectionId}.${documentId}`, commentNum, (isSuccess)=>{

				if(typeof callback == 'function')
					callback(isSuccess)
			})
		}, accountId, channelId)
	}

	/**
	 * @param {string} documentId
	 * @param {string} commentNum
	 * @param {object} paramDataCallback
	 * @param {function} callback
	 *    callback(isSuccess)
	 */
	change(documentId, commentNum, paramDataCallback, callback, accountId=null, channelId=null){
		let self = this
		let document = self.standard.document

		self.metadata.process((isSuccess)=>{
			if(!isSuccess){
				if(typeof callback == 'function')
					callback(isSuccess)
				if(typeof self.metadata.resolve == 'function')
					self.metadata.resolve()
				return
			}

			// 코멘트 연관관계 읽어오기
			self.metadata._read(`${self.documentCollectionId}.${documentId}`, commentNum, (isSuccess, commentLinkData)=>{

				// commentId 가 존재하지 않는 경우 반환
				if(!isSuccess || typeof commentLinkData != 'object'
					|| commentLinkData === undefined
					|| commentLinkData === null
					|| typeof commentLinkData['commentId'] == 'undefined'){

					if(typeof callback == 'function')
						callback(false)
					if(typeof self.metadata.resolve == 'function')
						self.metadata.resolve()
					return
				}

				// 실제 코멘트 도큐멘트 읽어오기
				let commentId = commentLinkData['commentId']
				self.metadata._get(`${self.documentCollectionId}.${commentId}`, (isSuccess, commentData)=>{

					// commentData 가 존재하지 않는 경우 반환
					// 작성자 정보가 다른 경우 반환
					if(!isSuccess || typeof commentData != 'object'
						|| commentData === undefined
						|| commentData === null
						|| typeof commentData['account'] === 'undefined'
						|| typeof commentData['channel'] === 'undefined'
						|| accountId !== null && (commentData['account'] != accountId)
						|| channelId !== null && (commentData['channel'] != channelId)){

						if(typeof callback == 'function')
							callback(false)
						if(typeof self.metadata.resolve == 'function')
							self.metadata.resolve()
						return
					}

					let paramData = paramDataCallback(commentData)
					self.metadata._set(`${self.documentCollectionId}.${commentId}`, paramData, (isSuccess)=>{

						// commentId 가 존재하지 않는 경우 반환
						if(!isSuccess){
								if(typeof callback == 'function')
									callback(false)
								if(typeof self.metadata.resolve == 'function')
									self.metadata.resolve()
								return
							}

							if(typeof callback == 'function')
								callback(true)
							if(typeof self.metadata.resolve == 'function')
								self.metadata.resolve()
						})
				})
			})
		})
	}
}