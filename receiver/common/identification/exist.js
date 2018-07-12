import {SchemaCheck} from '../common.js'
import Security from '../../security.js'
import Logger from '../../logger.js'
import moment from 'moment'

export default function Exist(

	request, response,
	database, databaseKey,
	processId, processType){

		let accountSchema = request.body
		let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()

		if(!SchemaCheck(response, accountSchema, ['id'], `${processType}가입`, processId)) return

		// 데이터베이스에 계정가입 확인을 시도합니다.
		database[databaseKey].isRegistered(accountSchema.id, (isExist)=>{

			// 계정가입 확인이 성공한 경우
			response.send({
				isSuccess: true,
				message: (isExist ? `해당 ${processType}은 이미 생성되어 있습니다.` 
						  : `해당 ${processType}은 생성되어 있지 않습니다.`)
			})
			response.end()
			Logger.log(`${processType} 존재 확인시도 (확인된 ID:${accountSchema.id}) (IP:${peerAddress})`, `[Backend:${processId}]`)
			return
		})
}