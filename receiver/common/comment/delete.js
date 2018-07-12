import {SchemaCheck} from '../common.js'
import {Authorize} from '../account.js'
import Security from '../../security.js'
import Logger from '../../logger.js'
import moment from 'moment'

export default function Delete(
	request, response,
	database, databaseKey,
	processId, processType){

	let accountSchema = request.body
	let currentTime = Number(moment().format('x'))
	let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()

	if(!SchemaCheck(response, accountSchema, ['id', 'peerId', 'channelId', 'documentId', 'commentId', 'commentNum'], `${processType}삭제`, processId)) return

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

		// 데이터베이스에 정보삭제를 시도합니다.
		database[databaseKey].delete(
			accountSchema.documentId,
			 accountSchema.commentId,
			 accountSchema.commentNum,
			 (isSuccess, status)=>{

			// 정보입력이 실패한 경우
			if(!isSuccess){
				response.send({
					isSuccess: false,
					message: ``})
				response.end()
				return
			}

			// 정보입력이 성공한 경우
			response.send({
				isSuccess:true,
				message: `${processType} 삭제에 성공하였습니다.`
			})
			response.end()
			Logger.log(`${processType}이 정상적으로 삭제되었습니다. (ID:${accountSchema.id})`, `[Backend:${processId}]`)
			return
		}, accountSchema.id, accountSchema.channelId)
	})
}