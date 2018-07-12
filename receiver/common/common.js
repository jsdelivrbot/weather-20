import Logger from '../logger.js'

export function SchemaCheck(response, accountSchema, needKeys = [], checkType='', callbackName=''){
	let isSchemaCorrect = true

	// 추가 식별정보 로깅
	let additionalSignature = ``
	if(typeof accountSchema['id'] !== 'undefined') additionalSignature += ` (UID: ${accountSchema['id']})`
	if(typeof accountSchema['peerId'] !== 'undefined') additionalSignature += ` (PID: ${accountSchema['peerId']})`
	if(typeof accountSchema['targetid'] !== 'undefined') additionalSignature += ` (TID: ${accountSchema['targetid']})`

	Logger.log(`${checkType} 확인 요청이 왔습니다.${additionalSignature}`, `[Backend:${callbackName}]`)

	if(typeof accountSchema !== 'object'
	  || typeof accountSchema == 'null'
	  || typeof accountSchema == 'undefined')
		isSchemaCorrect = false

	for(let needKey of needKeys){
		if(isSchemaCorrect && typeof accountSchema[needKey] === 'undefined'){
			isSchemaCorrect = false
			break
		}
	}

	if(!isSchemaCorrect){
		response.send({
			isSuccess: false,
			message: `통신문제로 인해 ${checkType} 확인 처리 실패하였습니다.`})
		response.end()
		let stringData = `(해석불가)`
		// 문자열로 변환시도
		try{ stringData = JSON.stringify(accountSchema) }catch(e){}

		Logger.log(`규격에 맞지 않는 ${checkType} 확인 요청이 발생했습니다: ${stringData}`, `[Backend:${callbackName}]`)

		return false
	}
	
	return true
}