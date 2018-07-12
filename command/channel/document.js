import API from '../../transmitter/transmitter.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/channel-document <계정ID> <게시글ID>`, `[Frontend:Channel]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 1){
		usage()
		return
	}

	Logger.log(`서버에 채널 게시글 읽기 요청을 전송합니다.`, `[Frontend:Channel]`)

	API.call('/api/channel/document',{
		id: commandArgs[0],
		docNum: commandArgs[1],
	},(paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, '채널 게시글 읽기 요청', `Channel`)
	})
}