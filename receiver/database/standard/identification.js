export default class Identification{
	constructor(standard, collectionId, documentCollectionId){
		this.standard = standard
		this.metadata = standard.metadata
		this.collectionId = collectionId
		this.documentCollectionId = documentCollectionId
	}

	/**
	 * @description
	 *
	 * @param {object} schema
	 *
	 * @param {function} callback
	 *    callback(isSuccess, message)
	 */
	register(schema, callback){
		this.update(schema, callback, 'register')
	}

	/**
	 * @description
	 *
	 * @param {object} schema
	 *
	 * @param {function} callback
	 *    callback(isSuccess, message)
	 */
	unregister(schema, callback){
		this.update(schema, callback, 'unregister')
	}

	/**
	 * @description
	 *
	 * @param {object} schema
	 *
	 * @param {function} callback
	 *    callback(isSuccess, message)
	 *
	 * @param {string} type
	 */
	update(schema, callback, type = 'none'){
		if(this.checkWrongSchema(schema)){
			callback(false, 'Wrong schma')
			return
		}

		this.metadata.change(`${this.collectionId}.${schema.id}`, 
			(isSuccess, data, status)=>{
				if(!isSuccess){
					callback(false, 'Database Get Error')
					return
				}

				switch(type){
					case 'unregister':
						// 만약 식별정보 삭제 처리인데
						// 이미 해당 데이터가 없으면
						if(data === null || data === undefined){
							callback(false, 'Already Unregistered')
							return
						}

						return {
							act: 'unset',
							data: schema
						}
						break
					case 'none':
						return { act: 'none' }
						break
					case 'register':
						// 만약 식별정보 생성 처리인데
						// 이미 해당 데이터가 있으면
						if(data !== null && data !== undefined){
							callback(false, 'Already Registered')
							return
						}
					default:
						return {
							act: 'set',
							data: schema
						}
						break
				}

			},(isSuccess, resolve)=>{
				if(!isSuccess){
					callback(false, 'Database Update Error')
					return
				}

				callback(true, 'Success')
				if(typeof resolve == 'function')resolve()
			}
		)
	}

	/**
	 * @description
	 *
	 * @param {object} schema
	 *
	 * @param {function} callback
	 *    callback(isSuccess, message)
	 */
	isRegistered(id, callback){
		if(typeof id != 'string'){
			callback(false, 'Wrong schma')
			return
		}

		this.metadata.exist(`${this.collectionId}.${id}`, (isExist, dataCount)=>{
			callback(isExist, (isExist ? 'Registered' : 'Not Registered'))
		})
	}
	_isRegistered(id, callback){
		if(typeof id != 'string'){
			callback(false, 'Wrong schma')
			return
		}

		this.metadata._exist(`${this.collectionId}.${id}`, (isExist, dataCount)=>{
			callback(isExist, (isExist ? 'Registered' : 'Not Registered'))
		})
	}

	/**
	 * @description
	 *
	 * @param {string} id
	 * @param {function} callback
	 *    callback(isSuccess, data)
	 */
	read(id, callback){
		this.metadata.get(`${this.collectionId}.${id}`, (isSuccess, data, status)=>{
			callback(isSuccess, data)
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

		if(typeof schema['id'] == 'undefined')
			return true

		if(!this.isValidId(schema['id']))
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

	/**
	 * @param {string} id
	 * @param {string} docNum
	 * @param {function} callback
	 *    callback(isSuccess, documentSchema)
	 */
	getDocument(id, docNum, callback){
		this.metadata.process((isSuccess)=>{
			this.metadata._get(`${this.collectionId}.${id}.${docNum}`, (isSuccess, documentId)=>{
				if(!isSuccess  || typeof documentId != 'string'){
					callback(isSuccess, null)
					this.metadata.resolve()
					return
				}

				this.metadata._get(`${this.documentCollectionId}.${documentId}`, (isSuccess, documentSchema)=>{
					if(!isSuccess  || typeof documentSchema != 'object'){
						callback(isSuccess, null)
						this.metadata.resolve()
						return
					}
					callback(isSuccess, documentSchema)
					this.metadata.resolve()
				})
			})
		})
	}

	/**
	 * @param {string} id
	 * @param {function} callback
	 *    callback(isSuccess, latest)
	 */
	getLatestDocumentNumber(id, callback){
		this.metadata.process((isSuccess)=>{
			this.metadata._get(`${this.collectionId}.${id}._latest`, (isSuccess, latest)=>{

				if(!isSuccess  || typeof latest != 'number'){
					callback(isSuccess, null)
					this.metadata.resolve()
					return
				}

				callback(isSuccess, latest)
				this.metadata.resolve()
			})
		})
	}

	/**
	 * @param {string} id
	 * @param {function} callback
	 *    callback(isSuccess, count)
	 */
	getActualDocumentCount(id, callback){
		this.metadata.count(`${this.collectionId}.${id}`, (isSuccess, count)=>{

			if(!isSuccess  || typeof count != 'number'){
				callback(isSuccess, null)
				return
			}

			callback(isSuccess, count)
		})
	}
}