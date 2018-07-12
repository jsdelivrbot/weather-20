import Logger from '../logger.js'

export default function callback(paramData, type, processId){
	let data = paramData

	Logger.log(`서버에서 ${type} 처리결과가 도착했습니다.`, `[Frontend:${processId}]`)
	console.log(' ')

	if(typeof data !== 'object'
	  || data === null
	  || data === undefined
	  || typeof data['isSuccess'] === 'undefined'
	  || typeof data['message'] === 'undefined'){

		let stringData = '알 수 없음'
		try{ stringData = JSON.stringify(data) }catch(e){}

		Logger.log(`통신 도중 문제가 발생해서 ${type}에 실패하였습니다.`, `[Frontend:${processId}]`)
		Logger.log(`서버로 부터 받은 내용:${stringData}`, `[Frontend:${processId}]`)
		console.log(' ')
		return
	}

	if(data.isSuccess){
		Logger.log(`${type}에 성공하였습니다.`, `[Frontend:${processId}]`)
		Logger.log(`서버로 부터 받은 내용: ${data.message}`, `[Frontend:${processId}]`)
		if(typeof data['schema'] != 'undefined')
			Logger.log(`서버로 부터 받은 스키마: ${JSON.stringify(data.schema)}`, `[Frontend:${processId}]`)
	} else{
		Logger.log(`${type}에 실패하였습니다.`, `[Frontend:${processId}]`)
		Logger.log(`서버로 부터 받은 내용: ${data.message}`, `[Frontend:${processId}]`)
		console.log(' ')
	}
}