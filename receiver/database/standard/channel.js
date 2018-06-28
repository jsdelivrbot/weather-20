import Collection from './collection.js'

export default class Channel extends Collection{
	constructor(standard, collectionId, subPartyCollectionId, documentCollectionId){
		super(standard, collectionId, documentCollectionId)
		this.subPartyCollectionId = subPartyCollectionId
		this.documentCollectionId = documentCollectionId
	}

	/**
	 * @description
	 *
	 * @param {string} channelId
	 * @param {string} accountId
	 * @param {function} callback
	 *    callback(isSuccess, status)
	 */
	join(channelId, accountId, callback){
		super.addProperty('member', channelId, accountId, callback)
	}

	/**
	 * @param {string} channelId
	 * @param {string} accountId
	 * @param {function} callback
	 *    callback(isSuccess, status)
	 */
	leave(channelId, accountId, callback){
		super.deleteProperty('member', channelId, accountId, callback)
	}

	/**
	 * @param {string} channelId
	 * @param {string} accountId
	 * @param {function} callback
	 *    callback(isMember)
	 */
	isMember(channelId, accountId, callback){
		super.isInnerProperty('member', channelId, accountId, callback)
	}

	/**
	 * @param {string} channelId
	 * @param {function} callback
	 *    callback(isSuccess, countNum)
	 */
	memberCount(channelId, callback){
		super.countProperty('member', channelId, callback)
	}

	/**
	 * @description
	 *
	 * @param {string} channelId
	 * @param {string} accountId
	 * @param {function} callback
	 *    callback(isSuccess, status)
	 */
	sign(channelId, accountId, callback){
		super.addProperty('manager', channelId, accountId, callback)
	}

	/**
	 * @param {string} channelId
	 * @param {string} accountId
	 * @param {function} callback
	 *    callback(isSuccess, status)
	 */
	resign(channelId, accountId, callback){
		super.deleteProperty('manager', channelId, accountId, callback)
	}

	/**
	 * @param {string} channelId
	 * @param {string} accountId
	 * @param {function} callback
	 *    callback(isManager)
	 */
	isManager(channelId, accountId, callback){
		super.isInnerProperty('manager', channelId, accountId, callback)
	}

	/**
	 * @param {string} channelId
	 * @param {function} callback
	 *    callback(isSuccess, countNum)
	 */
	managerCount(channelId, callback){
		super.countProperty('manager', channelId, callback)
	}

	/**
	 * @param {string} channelId
	 *    callback(isSuccess, subParty)
	 */
	subParty(channelId){
		let self = this
		let SubParty = require('./subparty.js').default
		return new SubParty(self.standard, `${self.subPartyCollectionId}.${channelId}`, self.subPartyCollectionId)
	}
}