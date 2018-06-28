export default class Notification {
	constructor(standard, collectionId){
		this.standard = standard
		this.metadata = standard.metadata
		this.collectionId = collectionId
	}

	/**
	 * @param {string} userId
	 * @param {object} data
	 * @param {function} callback
	 *    callback(isSuccess, id)
	 */
	push(userId, data, callback){
		this.metadata.create(`${this.collectionId}.${userId}`, data, (isSuccess, notificationId, resolve)=>{
			if(typeof callback == 'function')
				callback(isSuccess, notificationId)
			if(typeof resolve == 'function')
				resolve()
		})
	}

	/**
	 * @param {string} userId
	 * @param {function} callback
	 *    callback(isSuccess, count)
	 */
	count(userId, callback){
		this.metadata.count(`${this.collectionId}.${userId}`, callback)
	}

	/**
	 * @param {string} userId
	 * @param {string} notificationId
	 * @param {function} callback
	 *    callback(isSuccess, data)
	 */
	get(userId, notificationId, callback){
		this.metadata.read(`${this.collectionId}.${userId}`, notificationId, callback)
	}

	/**
	 * @param {string} userId
	 * @param {function} callback
	 *    callback(isSuccess, data)
	 */
	getAll(userId, callback){
		this.metadata.read(`${this.collectionId}.${userId}`, null, callback, true)
	}

	/**
	 * @param {string} userId
	 * @param {function} callback
	 *    callback(isSuccess, unsettedCount)
	 */
	clear(userId, callback){
		this.metadata.delete(`${this.collectionId}.${userId}`, null, callback, true)
	}
}