import {SchemaCheck} from '../common.js'
import Security from '../../security.js'
import Logger from '../../logger.js'
import moment from 'moment'

export default function Actual(
	request, response,
	database, databaseKey,
	processId, processType){

	let accountSchema = request.body
	if(!SchemaCheck(response, accountSchema, ['id'], `${processType} 게시글 갯수 열람`, processId)) return

	// 데이터베이스에서 계수 읽기를 시도합니다.
	database[databaseKey].getActualDocumentCount(accountSchema.id, (isSuccess, actualCount)=>{

		// 요청된 계수 정보가 없는 경우
		if(!isSuccess || typeof actualCount != 'number'){

			response.send({
				isSuccess: false,
				message: `0`
			})
			response.end()
			return
		}

		// 계정정보 확인이 성공한 경우
		response.send({
			isSuccess: true,
			message: `${actualCount}`
		})
		response.end()
	})
}