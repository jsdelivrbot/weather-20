import Collection from './collection.js'

export default class Emotion extends Collection{
	constructor(standard, collectionId){
		super(standard, collectionId)
	}

	/**
	 * @description
	 *
	 * @param {string} emotionType
	 * @param {string} documentId
	 * @param {string} accountId
	 * @param {function} callback
	 *    callback(isSuccess, status)
	 */
	express(emotionType, documentId, accountId, callback){
		super.addProperty(emotionType, documentId, accountId, callback, true)
	}

	/**
	 * @param {string} emotionType
	 * @param {string} documentId
	 * @param {string} accountId
	 * @param {function} callback
	 *    callback(isSuccess, status)
	 */
	depress(emotionType, documentId, accountId, callback){
		super.deleteProperty(emotionType, documentId, accountId, callback)
	}

	/**
	 * @param {string} emotionType
	 * @param {string} documentId
	 * @param {string} accountId
	 * @param {function} callback
	 *    callback(isSuccess)
	 */
	isExpressed(emotionType, documentId, accountId, callback){
		super.isInnerProperty(emotionType, documentId, accountId, callback)
	}

	/**
	 * @param {string} emotionType
	 * @param {string} documentId
	 * @param {function} callback
	 *    callback(isSuccess, countNum)
	 */
	expressCount(emotionType, documentId, callback){
		super.countProperty(emotionType, documentId, callback)
	}
}