import {SchemaCheck} from '../common.js'
import {Authorize} from '../account.js'
import Security from '../../security.js'
import Logger from '../../logger.js'
import moment from 'moment'

export default function ManagerCount(
	request, response,
	database, databaseKey,
	processId, processType){

	let accountSchema = request.body
	if(!SchemaCheck(response, accountSchema, ['id','peerId','channelId'], `${processType} 매니저 수 확인`, processId)) return

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

		// 데이터베이스에 정보입력을 시도합니다.
		database[databaseKey].managerCount(
			accountSchema.channelId,

			(isSuccess, countNum)=>{

				response.send({
					isSuccess: isSuccess,
					message: countNum})
				response.end()
			}
		)
	})
}