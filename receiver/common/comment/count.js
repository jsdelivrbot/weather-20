import {SchemaCheck} from '../common.js'
import Security from '../../security.js'
import Logger from '../../logger.js'
import moment from 'moment'

export default function Count(
	request, response,
	database, databaseKey,
	processId, processType){

	let accountSchema = request.body
	let currentTime = Number(moment().format('x'))
	let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()

	if(!SchemaCheck(response, accountSchema, ['documentId'], `${processType} 읽어오기`, processId)) return

	// 데이터베이스에서 정보 읽어오기를 시도합니다.
	database[databaseKey].count(accountSchema.documentId, (isExist, count)=>{

		// 정보를 읽어오는데 성공한 경우
		response.send({
			isSuccess: isExist,
			message: count,
		})
		response.end()
		return
	})
}