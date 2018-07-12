import API from '../../transmitter/transmitter.js'
import Security from '../../receiver/security.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/document-update <계정ID> <채널ID> <게시글ID> <게시글내용>`, `[Frontend:Document]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 4){
		usage()
		return
	}

	Logger.log(`서버에 채널 게시글 수정 요청을 전송합니다.`, `[Frontend:Document]`)

	API.call('/api/document/update',{
		id: commandArgs[0],
		channelId: commandArgs[1],
		documentId: commandArgs[2],
		context: commandArgs[3],
		peerId: 1234567890
	},(paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, '채널 게시글 수정', `Document`)
	})
}