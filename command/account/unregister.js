import API from '../../transmitter/transmitter.js'
import Security from '../../receiver/security.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/account-unregister <계정ID> <계정PW>`, `[Frontend:Account]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 2){
		usage()
		return
	}

	Logger.log(`서버에 회원탈퇴 요청을 전송합니다.`, `[Frontend:Account]`)

	API.call('/api/account/unregister',{
		id: commandArgs[0],
		pw: Security.hash(commandArgs[1])

	},(paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, '회원탈퇴', `Account`)
	})
}