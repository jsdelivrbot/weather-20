import API from '../../transmitter/transmitter.js'
import Security from '../../receiver/security.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/channel-member-count <계정ID> <채널ID>`, `[Frontend:Channel]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 2){
		usage()
		return
	}

	Logger.log(`서버에 채널 맴버 수 확인 요청을 전송합니다.`, `[Frontend:Channel]`)

	API.call('/api/channel/member-count',{
		id: commandArgs[0],
		channelId:  commandArgs[1],
		peerId: 1234567890
	},(paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, '채널 맴버 수 확인', `Channel`)
	})
}