import API from '../../transmitter/transmitter.js'
import Security from '../../receiver/security.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/document-read <게시글ID>`, `[Frontend:Document]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 1){
		usage()
		return
	}

	Logger.log(`서버에 채널 게시글 읽기 요청을 전송합니다.`, `[Frontend:Document]`)

	API.call('/api/document/read',{
		documentId: commandArgs[0]
	},(paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, '채널 게시글 읽기', `Document`)
	})
}