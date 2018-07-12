import API from '../../transmitter/transmitter.js'
import Security from '../../receiver/security.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/account-exist <계정ID>`, `[Frontend:Account]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 1){
		usage()
		return
	}

	Logger.log(`서버에 계정가입 확인 요청을 전송합니다.`, `[Frontend:Account]`)
	//let peerId = Math.floor(Math.random() * 999999999999)

	API.call(`/api/account/exist`, {
		id: commandArgs[0]
	}, (paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, `계정가입 확인`, `Account`)
	})
}