import API from '../../transmitter/transmitter.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/channel-leave <계정명> <채널명>`, `[Frontend:Channel]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 1){
		usage()
		return
	}
	
	Logger.log(`서버에 채널 탈퇴 요청을 전송합니다.`, `[Frontend:Channel]`)

	API.call('/api/channel/leave',{
		id: commandArgs[0],
		channelId: commandArgs[1],
		peerId: 1234567890
	},(paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, '채널 탈퇴', `Channel`)
	})
}