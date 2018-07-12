import API from '../../transmitter/transmitter.js'
import Security from '../../receiver/security.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/document-delete <계정ID> <채널ID> <게시글ID>`, `[Frontend:Document]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 3){
		usage()
		return
	}

	Logger.log(`서버에 채널 게시글 삭제 요청을 전송합니다.`, `[Frontend:Document]`)

	API.call('/api/document/delete',{
		id: commandArgs[0],
		channelId: commandArgs[1],
		documentId: commandArgs[2],
		peerId: 1234567890
	},(paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, '채널 게시글 삭제', `Document`)
	})
}