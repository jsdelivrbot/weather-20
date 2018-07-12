import API from '../../transmitter/transmitter.js'
import Security from '../../receiver/security.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/channel-register <계정ID> <계정PW> <닉네임> <이름>`, `[Frontend:Channel]`)
}

export default (commandArgs) => {
	if(commandArgs.length < 4){
		usage()
		return
	}

	Logger.log(`서버에 채널생성 요청을 전송합니다.`, `[Frontend:Channel]`)

	API.call('/api/channel/register',{
		
		// 아래부터 공개 데이터
		id: commandArgs[0],
		nickName: commandArgs[2],
		realName: commandArgs[3],
		introduce:'개인소개문',

		// 아래부터 비공개 데이터
		pw: Security.hash(commandArgs[1]),
		logined: {},
		peerId: 1234567890,

		// 앱 내부 이용 데이터
		aftercare: {}

	},(paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, '채널생성', `Channel`)
	})
}