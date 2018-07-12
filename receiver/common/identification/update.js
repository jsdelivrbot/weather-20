import {SchemaCheck} from '../common.js'
import Security from '../../security.js'
import Logger from '../../logger.js'
import moment from 'moment'

export default function Update(
	request, response,
	database, databaseKey,
	processId, processType){

	let accountSchema = request.body
	if(!SchemaCheck(response, accountSchema, ['id', 'pw', 'peerId'], `${processType}정보 갱신`, processId)) return

	// 데이터베이스에서 정보읽기를 시도합니다.
	database[databaseKey].read(accountSchema.id, (isExist, readedAccountSchema)=>{

		// 계정정보가 없는 경우
		if(!isExist || typeof readedAccountSchema != 'object'
		  || readedAccountSchema === undefined
		  || readedAccountSchema === null){
			response.send({
				isSuccess:false,
				message: `해당하는 ${processType}이 존재하지 않습니다.`
			})
			response.end()
			Logger.log(`${processType}정보 갱신 실패가 발생하였습니다. (ID:${accountSchema.id}) (${processType} 미존재)`, `[Backend:${processId}]`)
			return
		}

		// 비밀번호가 다른 경우
		if(accountSchema.pw != readedAccountSchema.pw){
			response.send({
				isSuccess:false,
				message: `${processType} 비밀번호가 다릅니다. ${processType}정보 갱신 실패`
			})
			response.end()
			Logger.log(`${processType}정보 갱신 실패가 발생하였습니다. (ID:${accountSchema.id}) (비밀번호 불일치)`, `[Backend:${processId}]`)
			return
		}

		// 계정접속 성공
		let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()
		let peerId = accountSchema.peerId

		// 이미 로그인 되어 있는지 여부 확인용
		// + 오래된 로그인 이력 삭제용

		let isLogined = false
		for(let loginedIndex of Object.keys(readedAccountSchema.logined)){

			// loginedIndex 는 이전 로그인 한 시간입니다.
			let logined = readedAccountSchema.logined[loginedIndex]

			// 로그인 한지 1시간 이상 지났으면 이전 이력 삭제 후 넘어가기
			let lastLoginedDiff = moment(Number(loginedIndex)).diff(moment(), 'hours')

			if(lastLoginedDiff >= 1)
				continue

			// 만약 1시간 내외에 동일한
			// id&ip로 인증 했다면 로그인상태로 간주
			if(logined.peerAddress == peerAddress
			  && logined.peerId == peerId){
				isLogined = true
				break
			}
		}

		// 로그인 정보 추가
		let currentTime = Number(moment().format('x'))

		// 로그인 상태가 아니면 로그인처리
		if(!isLogined){
			accountSchema.logined[currentTime] = {
				peerAddress: peerAddress,
				peerId: peerId
			}
		}

		// 로그인 정보 추가 후 정보 갱신
		database[databaseKey].update(accountSchema, (isSuccess, message)=>{

			// 정보입력에 실패한 경우
			if(!isSuccess){
				response.send({
					isSuccess: false,
					message: `서버 지연으로 인해 ${processType}접속 처리에 실패했습니다.`
				})
				response.end()
				Logger.log(`${processType} 접속 중 DB지연으로 접속 실패하였습니다. (ID:${accountSchema.id}) (IP:${peerAddress}) (PID:${peerId})`, `[Backend:${processId}]`)
			}

			// 정보입력이 성공한 경우
			response.send({
				isSuccess: true,
				message: `${processType}정보 갱신에 성공하였습니다.`
			})
			response.end()
			Logger.log(`${processType}정보 갱신에 성공하였습니다. (ID:${accountSchema.id}) (IP:${peerAddress}) (PID:${peerId})`, `[Backend:${processId}]`)
		})
	})
}