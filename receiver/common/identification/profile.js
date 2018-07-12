import {SchemaCheck} from '../common.js'
import Security from '../../security.js'
import Logger from '../../logger.js'
import moment from 'moment'

const publicAllowedKey = [
	'id',
	'nickName',
	'realName',
	'introduce'
]

export default function Profile(
	request, response,
	database, databaseKey,
	processId, processType){

	let accountSchema = request.body

	if(!SchemaCheck(response, accountSchema, ['id', 'targetId', 'peerId'], `${processType} 정보열람`, processId)) return

	// 데이터베이스에서 요청자 정보읽기를 시도합니다.
	database[databaseKey].read(accountSchema.id, (isExist, requesterAccountSchema)=>{

		let isCanReadFullProfile = true

		// 요청자와 열람대상의 ID가 동일한 경우만 허용
		if(accountSchema.id != accountSchema.targetId)
			isCanReadFullProfile = false

		// 요청자 계정정보가 없는 경우
		if(isCanReadFullProfile && ( !isExist || typeof requesterAccountSchema != 'object'
		  || requesterAccountSchema === undefined
		  || requesterAccountSchema === null
		  || typeof requesterAccountSchema['logined'] === 'undefined')){

			isCanReadFullProfile = false
		}

		// 요청자 계정 로그인 상태 확인
		let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()
		let peerId = accountSchema.peerId

		if(isCanReadFullProfile
		   && accountSchema.id == accountSchema.targetId
		   && typeof requesterAccountSchema['logined'] !== 'undefined'){

			for(let loginedIndex of Object.keys(requesterAccountSchema.logined)){

				// loginedIndex 는 이전 로그인 한 시간입니다.
				let logined = requesterAccountSchema.logined[loginedIndex]

				// 로그인 한지 1시간 이상 지났으면 이전 이력 삭제 후 넘어가기
				let lastLoginedDiff = moment(Number(loginedIndex)).diff(moment(), 'hours')

				if(lastLoginedDiff >= 1)
					continue

				// 만약 1시간 내외에 동일한
				// id&ip로 인증 했다면 로그인상태로 간주
				if(logined.peerAddress == peerAddress
				  && logined.peerId == peerId){

					isCanReadFullProfile = true
					break
				}
			}
		}

		// 데이터베이스에서 요청된 계정 정보읽기를 시도합니다
		database[databaseKey].read(accountSchema.targetId, (isExist, requestedAccountSchema)=>{

			// 요청된 계정정보가 없는 경우
			if(!isExist || typeof requestedAccountSchema != 'object'
			  || requestedAccountSchema === undefined
			  || requestedAccountSchema === null){

				response.send({
					isSuccess: false,
					message: `해당 ${processType}정보가 존재하지 않습니다.`,
					schema: requestedAccountSchema
				})
				response.end()
				return
			}

			// 만약 개인정보를 읽을 권한이 없다면
			// 공개 정보 외에 다른 정보 삭제
			if(!isCanReadFullProfile){
				for(let innerSchemaIndex of Object.keys(requestedAccountSchema)){
					if(publicAllowedKey.indexOf(innerSchemaIndex) == -1)
						delete requestedAccountSchema[innerSchemaIndex]
				}
			}

			// 계정정보 확인이 성공한 경우
			response.send({
				isSuccess: true,
				message: `${processType}정보 열람에 성공하였습니다.`,
				schema: requestedAccountSchema
			})
			response.end()

			Logger.log(`${processType}정보 열람에 성공하였습니다. (열람자 ID:${accountSchema.id}) (열람된 ID:${accountSchema.targetId}) (IP:${peerAddress}) (PID:${peerId})`, `[Backend:${processId}]`)
		})
	})
}