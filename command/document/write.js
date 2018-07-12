import API from '../../transmitter/transmitter.js'
import Security from '../../receiver/security.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/document-write <계정ID> <채널ID> <...게시글내용>`, `[Frontend:Document]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 3){
		usage()
		return
	}

	let accountId = commandArgs.shift()
	let channelId = commandArgs.shift()
	let context = commandArgs.join(' ')

	Logger.log(`서버에 채널 게시글 작성 요청을 전송합니다.`, `[Frontend:Document]`)

	API.call('/api/document/write',{
		id: accountId,
		channelId: channelId,
		context: context,
		peerId: 1234567890
	},(paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, '채널 게시글 작성', `Document`)
	})
}