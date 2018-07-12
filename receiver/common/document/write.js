import {SchemaCheck} from '../common.js'
import {Authorize} from '../account.js'
import Security from '../../security.js'
import Logger from '../../logger.js'
import moment from 'moment'

export default function Write(
	request, response,
	database, databaseKey,
	processId, processType){

	// 요청 처리시 필요한 기본인자 변수
	let accountSchema = request.body
	let currentTime = Number(moment().format('x'))
	let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()

	if(!SchemaCheck(response, accountSchema, ['id', 'peerId', 'channelId', 'context'], `${processType} 삭제`, processId)) return

	// 입력받은 계정정보의 권한을 확인합니다.
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

		// 채널에 소속되어 있지 않다면
		if(!isMember && !isManager){
			response.send({
				isSuccess: false,
				message: `해당 채널에 가입되어 있지 않습니다.`})
			response.end()
			return
		}

		// 게시글 작성 처리시작
		database[databaseKey].write({
			context: accountSchema.context,
			timestamp: currentTime

		}, (isSuccess, documentId)=>{

			response.send({
				isSuccess: isSuccess,
				message: documentId})
			response.end()
		}, accountSchema.id, accountSchema.channelId)
	})
}