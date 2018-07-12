import {SchemaCheck} from '../common.js'
import Security from '../../security.js'
import Logger from '../../logger.js'
import moment from 'moment'

export default function Unegister(
	request, response,
	database, databaseKey,
	processId, processType){

	let accountSchema = request.body
	if(!SchemaCheck(response, accountSchema, [], `${processType}탈퇴`, processId)) return

	let currentTime = Number(moment().format('x'))
	let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()

	// 데이터베이스에 정보삭제를 시도합니다.
	database[databaseKey].unregister(accountSchema, (isSuccess, status)=>{
		let accountId = '[알 수없음]'
		try{ accountId = String(accountSchema.id) }catch(e){}

		// 정보입력이 실패한 경우
		if(!isSuccess){
			let responseFailMessage = `알 수 없는 문제로 인해 처리에 실패하였습니다.`

			switch(status){
				case 'Database Get Error':
				case 'Database Update Error':
					responseFailMessage = `서버 지연으로 인해 ${processType}삭제 처리에 실패했습니다.`
					break
				case 'Already Unregistered':
					responseFailMessage = `이미 존재하지 않는 ${processType}입니다.`
					break
			}

			response.send({
				isSuccess: false,
				message: responseFailMessage})
			response.end()
			Logger.log(`${processType}탈퇴 실패가 발생하였습니다. (ID:${accountId}) (${responseFailMessage})`, `[Backend:${processId}]`)
			return
		}

		// 정보입력이 성공한 경우
		response.send({
			isSuccess:true,
			message: `${processType}탈퇴에 성공하였습니다.`
		})
		response.end()
		Logger.log(`${processType}이 정상적으로 탈퇴되었습니다. (ID:${accountId})`, `[Backend:${processId}]`)
		return
	})
}