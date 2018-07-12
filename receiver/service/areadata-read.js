import Logger from '../../logger.js'

export function Read(cell, callback){

	// 채널 게시글 정보 존재 검증용
	global.Metadata.channel.getLatestDocumentNumber(cell, (isSuccess, latest)=>{

		global.Metadata.channel.getDocument(cell, latest, (isSuccess, documentData)=>{
			if(isSuccess){
				if(typeof callback == 'function'){
					// 기본 스키마 적용
					if(documentData === null || documentData === undefined){
						documentData = {
							data: null
						}
					}
					if(documentData.data === null || documentData.data === undefined){
						documentData.data = {
							tempIndex: null,
							realTemp: null,
							reportedTime: null,
							subtitles: []
						}
					}
					
					callback({
						isSuccess: true,
						data: documentData
					})
				}
			}else{
				if(typeof callback == 'function'){
					callback({
						isSuccess: false,
						message: `통신문제로 해당 정보갱신에 실패하였습니다.`
					})
				}
			}
		})
	})
}

export default function AreaDataRead(app, database) {
	app.post(`/api/areadata-read`, (request, response)=>{

		let accountSchema = request.body
		if(accountSchema === undefined || accountSchema === null) return

		if(typeof accountSchema['cell'] === 'undefined'){
			response.send(null)
			response.end()
			return
		}

		Read(accountSchema['cell'], (plain)=>{
			response.send(plain)
			response.end()
		})
	})
}