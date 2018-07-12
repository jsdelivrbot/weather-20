import {SchemaCheck} from '../common.js'
import {Authorize} from '../account.js'
import Security from '../../security.js'
import Logger from '../../logger.js'
import moment from 'moment'

export default function Join(
	request, response,
	database, databaseKey,
	processId, processType,
	allowedPropertyTypes){

	let accountSchema = request.body
	if(!SchemaCheck(response, accountSchema, ['id','peerId','targetId', 'type'], `${processType} 가입`, processId)) return

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

		// 허용된 타입 유형이 아니라면
		let isAllowedPropertyType = allowedPropertyTypes.indexOf(accountSchema.type) !== -1
		if(!isAllowedPropertyType){
	
			//
		}

			
		// 이미 가입되어 있다면
		if(isMember){
			response.send({
				isSuccess: false,
				message: `이미 ${processType}가입 되어 있습니다.`})
			response.end()
			return
		}

		// 데이터베이스에 정보입력을 시도합니다.
		database[databaseKey].join(
			accountSchema.channelId,
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
							message = `이미 ${processType}에 가입 되어 있습니다.`
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
}