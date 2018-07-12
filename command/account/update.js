import API from '../../transmitter/transmitter.js'
import Security from '../../receiver/security.js'
import Logger from '../../logger.js'
import DefaultCallback from '../transmitter-callback.js'

export function usage(){
	Logger.log(`/account-update <계정ID> <계정PW> <변경할 소개문>`, `[Frontend:Account]`)
	console.log(' ')
}

export default (commandArgs) => {
	if(commandArgs.length < 4){
		usage()
		return
	}

	Logger.log(`서버에 계정정보 갱신 요청을 전송합니다.`, `[Frontend:Account]`)
	//let peerId = Math.floor(Math.random() * 999999999999)

	API.call('/api/account/update',{
		
		// 아래부터 공개 데이터
		id: commandArgs[0],
		nickName: '닉네임',
		realName: '실제명',
		introduce: commandArgs[2],

		// 아래부터 비공개 데이터
		pw: Security.hash(commandArgs[1]),
		logined: {},
		peerId: 1234567890,
		random: Math.floor(Math.random() * 999999999999),

		// 앱 내부 이용 데이터
		aftercare: {
			isWoman: false,
			kg: '65',
			limitMG: '14',
			crrentMG: '0'
		}

	},(paramData)=>{

		// 기본 처리콜백
		DefaultCallback(paramData, '계정정보 갱신', `Account`)
	})
}