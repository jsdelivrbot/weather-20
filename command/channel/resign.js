import API from '../../transmitter/transmitter.js'
import Security from '../../receiver/security.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/channel-resign <계정ID> <채널ID> <채널PW>`, `[Frontend:Channel]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 3){
		usage()
		return
	}

	Logger.log(`서버에 채널 관리자 탈퇴 요청을 전송합니다.`, `[Frontend:Channel]`)

	API.call('/api/channel/resign',{
		id: commandArgs[0],
		channelId:  commandArgs[1],
		channelPw: commandArgs[2],
		peerId: 1234567890
	},(paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, '채널 관리자 탈퇴', `Channel`)
	})
}