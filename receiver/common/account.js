import Identification from './identification/identification.js'
import Security from '../security.js'
import Logger from '../logger.js'
import moment from 'moment'

let database = null

export function Account(paramApp, paramDatabase){
	if(database === null) database = paramDatabase

	Identification(paramApp, paramDatabase, `account`, `/api/account`, `Account`, `계정`)
}

/**
 * @description
 * 해당 회원이 서비스 기본 이용권한이 있는지 확인합니다.
 *
 * @param {string} accountId 계정ID
 * @param {string} accountPw 계정PW
 * @param {string} peerIp 피어IP
 * @param {string} peerId 피어ID
 * @param {string} channelId 채널ID
 * @param {string} channelPw 채널PW
 * @param {function} callback
 *    callback(isExist, isLogined, isPwMatch, isMember, isManager, isChannelPwMatch, requesterAccountSchema)
 */
export function Authorize

	(accountId, accountPw,
	peerIp, peerId,
	channelId, channelPw, callback){

	// 채널 가입 확인 후 처리되는 인증함수
	let process = (isMember, isManager, isChannelPwMatch)=>{

		// 데이터베이스에서 요청자 정보읽기를 시도합니다.
		database.account.read(accountId, (isExist, requesterAccountSchema)=>{

			// 계정정보가 없는 경우
			if(!isExist || typeof requesterAccountSchema != 'object'
			  || requesterAccountSchema === undefined
			  || requesterAccountSchema === null){

				callback(false, false, false,
						 isMember, isManager, isChannelPwMatch,
						 requesterAccountSchema)
				return
			}

			// 비밀번호가 맞지 않는 경우
			let isPwMatch = accountPw === requesterAccountSchema.pw

			// 요청자 계정 로그인 상태 확인
			let isLogined = false
			if(typeof requesterAccountSchema['logined'] !== 'undefined'){

				for(let loginedIndex of Object.keys(requesterAccountSchema.logined)){

					// loginedIndex 는 이전 로그인 한 시간입니다.
					let logined = requesterAccountSchema.logined[loginedIndex]

					// 로그인 한지 1시간 이상 지났으면 이전 이력 삭제 후 넘어가기
					let lastLoginedDiff = moment(Number(loginedIndex)).diff(moment(), 'hours')

					if(lastLoginedDiff >= 1) continue

					// 만약 1시간 내외에 동일한
					// id&ip로 인증 했다면 로그인상태로 간주
					if(logined.peerAddress == peerIp
					  && logined.peerId == peerId){
						isLogined = true
						break
					}
				}
			}

			callback(isExist, isLogined, isPwMatch,
					 isMember, isManager, isChannelPwMatch,
					 requesterAccountSchema)
		})
	}

	if(channelId === undefined
	  || channelId === null){

		process(false, false)
		return
	}

	// 채널 존재 확인 여부 및 채널가입 여부 확인
	database.channel.metadata.get(`${database.channel.collectionId}.${channelId}`, (isSuccess, channelData, status)=>{

		// 정보를 읽는데 실패한 경우
		if(!isSuccess
			|| channelData === undefined
			|| channelData === null
			|| typeof channelData != 'object'){

			process(false, false, false)
			return
		}

		// 콜렉션 내에 속해있는지 확인
		let isMember = false
		if(typeof channelData['member'] == 'object')
			isMember = channelData['member'].indexOf(accountId) !== -1

		let isManager = false
		if(typeof channelData['manager'] == 'object')
		isManager = channelData['manager'].indexOf(accountId) !== -1

		// 패스워드 동일한지 확인
		let isChannelPwMatch = false
		if(typeof channelData['pw'] == 'string')
			isChannelPwMatch = channelData['pw'] === channelPw

		process(isMember, isManager, isChannelPwMatch)
	})
}

/**
 * @description
 * 해당 회원이 서비스 기본 이용권한이 있는지 확인합니다.
 *
 * @param {string} accountId 계정아이디
 * @param {string} channelId 채널ID
 * @param {string} subPartyId 파티ID
 * @param {string} subPartyPw 파티PW
 * @param {function} callback
 *    callback(isSubPartyMember, isSubPartyManager, isSubPartyPwMatch)
 */
export function SubPartyAuthorize

	(accountId, channelId,
	subPartyId, subPartyPw, callback){

	if(subPartyId === undefined
	  || subPartyId === null
	  || channelId === undefined
	  || channelId === null){

		callback(false, false, false)
		return
	}

	// 채널 존재 확인 여부 및 채널가입 여부 확인
	let subParty = database.channel.subParty(channelId)
	subParty.read(subPartyId, (isSuccess, subPartyData)=>{

		// 정보를 읽는데 실패한 경우
		if(!isSuccess
			|| subPartyData === undefined
			|| subPartyData === null
			|| typeof subPartyData != 'object'){

			callback(false, false, false)
			return
		}

		// 콜렉션 내에 속해있는지 확인
		let isMember = false
		if(typeof subPartyData['member'] == 'object')
			isMember = subPartyData['member'].indexOf(accountId) !== -1

		let isManager = false
		if(typeof subPartyData['manager'] == 'object')
		isManager = subPartyData['manager'].indexOf(accountId) !== -1

		// 패스워드 동일한지 확인
		let isSubPartyPwMatch = false
		if(typeof subPartyData['pw'] == 'string')
			isSubPartyPwMatch = subPartyData['pw'] === subPartyPw

		callback(isMember, isManager, isSubPartyPwMatch)
	})
}