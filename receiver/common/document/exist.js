import {SchemaCheck} from '../common.js'
import Security from '../../security.js'
import Logger from '../../logger.js'
import moment from 'moment'

export default function Exist(
	request, response,
	database, databaseKey,
	processId, processType){

	let accountSchema = request.body
	let currentTime = Number(moment().format('x'))
	let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()

	if(!SchemaCheck(response, accountSchema, ['documentId'], `${processType} 존재여부 확인`, processId)) return

	// 데이터베이스에 정보 존재여부 확인을 시도합니다.
	database[databaseKey].exist(accountSchema.documentId, (isExist)=>{

		// 정보확인이 성공한 경우
		response.send({
			isSuccess: isExist,
			message: ``
		})
		response.end()
		return
	})
}