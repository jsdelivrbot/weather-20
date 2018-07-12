import API from '../../transmitter/transmitter.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/account-actual <계정명>`, `[Frontend:Account]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 1){
		usage()
		return
	}

	Logger.log(`서버에 계정 게시글 갯수확인 요청을 전송합니다.`, `[Frontend:Account]`)

	API.call('/api/account/actual',{
		id: commandArgs[0],
	},(paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, '계정 게시글 갯수확인', `Account`)
	})
}