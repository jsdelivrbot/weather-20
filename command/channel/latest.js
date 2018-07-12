import API from '../../transmitter/transmitter.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/channel-latest <계정ID>`, `[Frontend:Channel]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 1){
		usage()
		return
	}

	Logger.log(`서버에 해당 채널의 최근 게시글 번호 요청을 전송합니다.`, `[Frontend:Channel]`)

	API.call('/api/channel/latest',{
		id: commandArgs[0],
	},(paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, '해당 채널의 최근 게시글 번호 확인', `Channel`)
	})
}