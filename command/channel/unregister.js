import API from '../../transmitter/transmitter.js'
import Security from '../../receiver/security.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/channel-unregister <계정ID> <계정PW>`, `[Frontend:Channel]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 2){
		usage()
		return
	}

	Logger.log(`서버에 채널삭제 요청을 전송합니다.`, `[Frontend:Channel]`)

	API.call('/api/channel/unregister',{
		id: commandArgs[0],
		pw: Security.hash(commandArgs[1])

	},(paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, '채널삭제', `Channel`)
	})
}