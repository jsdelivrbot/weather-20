import API from '../../transmitter/transmitter.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/channel-profile <열람자ID> <대상ID>`, `[Frontend:Channel]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 2){
		usage()
		return
	}

	Logger.log(`서버에 채널 정보확인 요청을 전송합니다.`, `[Frontend:Channel]`)

	API.call('/api/channel/profile',{
		id: commandArgs[0],
		peerId: 1234567890,
		targetId: commandArgs[1]
	},(paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, '채널 정보열람', `Channel`)
	})
}