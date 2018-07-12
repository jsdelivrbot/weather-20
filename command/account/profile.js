import API from '../../transmitter/transmitter.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/account-profile <열람자ID> <대상ID>`, `[Frontend:Account]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 2){
		usage()
		return
	}

	Logger.log(`서버에 계정 정보확인 요청을 전송합니다.`, `[Frontend:Account]`)

	API.call('/api/account/profile',{
		id: commandArgs[0],
		peerId: 1234567890,
		targetId: commandArgs[1]
	},(paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, '계정 정보열람', `Account`)
	})
}