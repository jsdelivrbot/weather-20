import API from '../../transmitter/transmitter.js'
import Security from '../../receiver/security.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/channel-exist <계정ID>`, `[Frontend:Channel]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 1){
		usage()
		return
	}

	Logger.log(`서버에 채널생성 확인 요청을 전송합니다.`, `[Frontend:Channel]`)

	API.call(`/api/channel/exist`, {
		id: commandArgs[0]
	}, (paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, `채널생성 확인`, `Channel`)
	})
}