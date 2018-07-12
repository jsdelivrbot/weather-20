import {SchemaCheck} from '../common.js'
import {Authorize, SubPartyAuthorize} from '../account.js'
import Security from '../../security.js'
import Logger from '../../logger.js'
import moment from 'moment'

export default function Sign(
	request, response,
	database, databaseKey,
	processId, processType){

	let accountSchema = request.body
	if(!SchemaCheck(response, accountSchema, ['id','peerId','channelId','subPartyId','subPartyPw'], `${processType} 가입`, processId)) return

	let currentTime = Number(moment().format('x'))
	let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()

	// 권한 확인
	Authorize(
		accountSchema.id, null,
		peerAddress, accountSchema.peerId,
		accountSchema.channelId, accountSchema.channelPw,

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
			accountSchema.subPartyId, accountSchema.subPartyPw, 

			(isSubPartyMember, isSubPartyManager, isSubPartyPwMatch)=>{

			// 이미 가입되어 있다면
			if(isSubPartyManager){
				response.send({
					isSuccess: false,
					message: `이미 ${processType} 획득 되어 있습니다.`})
				response.end()
				return
			}

			if(!isSubPartyPwMatch){
				response.send({
					isSuccess: false,
					message: `${processType} 비밀번호가 다릅니다.`})
				response.end()
				return
			}

			let subParty = database[databaseKey].subParty(accountSchema.channelId)

			// 데이터베이스에 정보입력을 시도합니다.
			subParty.sign(
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
							case 'Already Added':
								message = `이미 ${processType}가입 되어 있습니다.`
								break
							case 'Update failed':
								message = `네트워크 문제로 ${processType}가입에 실패했습니다.`
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
						message: `${processType} 가입에 성공했습니다.`})
					response.end()
				}
			)
		})
	})
}