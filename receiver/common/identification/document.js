import {SchemaCheck} from '../common.js'
import Security from '../../security.js'
import Logger from '../../logger.js'
import moment from 'moment'

export default function Document(
	request, response,
	database, databaseKey,
	processId, processType){

	let accountSchema = request.body
	if(!SchemaCheck(response, accountSchema, ['id', 'docNum'], `${processType} 게시글 열람`, processId)) return

	// 데이터베이스에서 게시글 읽기를 시도합니다.
	database[databaseKey].getDocument(accountSchema.id, accountSchema.docNum, (isSuccess, documentSchema)=>{

		// 요청자 계정정보가 없는 경우
		if(!isSuccess || typeof documentSchema != 'object'
		  || documentSchema === undefined
		  || documentSchema === null
		  || typeof documentSchema['context'] === 'undefined'){

			response.send({
				isSuccess: false,
				message: ``
			})
			response.end()
			return
		}

		// 계정정보 확인이 성공한 경우
		response.send({
			isSuccess: true,
			message: `${processType} 게시글 열람에 성공하였습니다.`,
			schema: documentSchema
		})
		response.end()
	})
}