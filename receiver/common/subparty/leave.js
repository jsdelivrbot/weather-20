import {SchemaCheck} from '../common.js'
import {Authorize, SubPartyAuthorize} from '../account.js'
import Security from '../../security.js'
import Logger from '../../logger.js'
import moment from 'moment'

export default function Leave(
	request, response,
	database, databaseKey,
	processId, processType){

	let accountSchema = request.body
	if(!SchemaCheck(response, accountSchema, ['id','peerId','channelId', 'subPartyId'], `${processType} 탈퇴`, processId)) return

	let currentTime = Number(moment().format('x'))
	let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()

	// 권한 확인
	Authorize(
		accountSchema.id, null,
		peerAddress, accountSchema.peerId,
		accountSchema.channelId, null,

		(isExist, isLogined, isPwMatch, isMember, isManager, isChannelPwMatch, requesterAccountSchema)=>{

		// 시도한 계정이 존재하지 않거나 로그인 전이라면
		if(!isExist || !isLogined){
			response.send({
				isSuccess: false,
				message: `로그인이 필요한 서비스입니다.`})
			response.end()
			return
		}

		SubPartyAuthorize(
			accountSchema.id, accountSchema.channelId,
			accountSchema.subPartyId, null, 

			(isSubPartyMember, isSubPartyManager, isSubPartyPwMatch)=>{

			// 이미 멤버가 아닌 경우
			if(!isSubPartyMember){
				response.send({
					isSuccess: false,
					message: `해당 ${processType}에서 이미 탈퇴되어 있습니다.`})
				response.end()
				return
			}

			let subParty = database[databaseKey].subParty(accountSchema.channelId)

			// 데이터베이스에 정보입력을 시도합니다.
			subParty.leave(
				accountSchema.subPartyId,
				accountSchema.id,

				(isSuccess, status)=>{

					// 처리에 실패한 경우 메시지 해석
					if(!isSuccess){
						let message
						switch(status){
							case 'Not exist collection':
								message = `해당 ${processType}이 존재하지 않습니다.`
								break
							case 'Already Removed':
								message = `이미 ${processType}에 가입 되어있지 않습니다.`
								break
							case 'Update failed':
								message = `네트워크 문제로 ${processType}탈퇴에 실패했습니다.`
								break
						}
						response.send({
							isSuccess: false,
							message: message})
						response.end()
						return
					}

					response.send({
						isSuccess: true,
						message: `${processType} 탈퇴에 성공했습니다.`})
					response.end()
				}
			)
		})

	})
}