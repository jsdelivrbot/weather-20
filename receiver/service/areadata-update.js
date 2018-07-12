import {SchemaCheck} from '../common/common.js'
import {Authorize} from '../common/account.js'
import Logger from '../../logger.js'

export function Update(accountSchema, peerAddress, callback, isImportantUpdate = true){
	Authorize(
			accountSchema.id, accountSchema.pw,
			peerAddress, accountSchema.peerId,
			accountSchema.channelId, null,

	(isExist, isLogined, isPwMatch, isMember, isManager, isChannelPwMatch, requesterAccountSchema)=>{

		if(!isExist || !isPwMatch){
			if(typeof callback == 'function'){
				callback({
					isSuccess: false,
					message: `계정정보가 일치하지 않으므로 처리할 수 없습니다.`
				})
			}
			return
		}

		global.Metadata.metadata.get(`overpower`, (isSuccess, data)=>{
			// 해당지역 매니저일 경우
			global.Metadata.channel.isManager(accountSchema.cell, accountSchema.id, (isLocalAdmin)=>{
				// OP일 경우
				let isHighestAdmin = data.indexOf(accountSchema.id) !== -1

				if(!isLocalAdmin && !isHighestAdmin){
					if(typeof callback == 'function'){
						callback({
							isSuccess: false,
							message: `아직 권한이 허용 되지 않은 계정입니다.\n이후 관리자의 승인을 기다려주세요.`
						})
					}
				} else {
					// 채널 게시글 정보 존재 검증용
					global.Metadata.channel.getDocument(accountSchema.cell, 1, (isSuccess, originPastDocument)=>{
						if(originPastDocument === null || originPastDocument === undefined){

							// 최신게시글 id가 0이면 게시글 하나만 생성시키고,
							// 그 게시글에 모든 자료 추가,
							global.Metadata.document.write({
								context: '',
								timestamp: '',
								data: accountSchema.data
							}, (isSuccess, documentId)=>{

								// 업데이트 성공여부
								if(isSuccess){
									if(typeof callback == 'function'){
										callback({
											isSuccess: true,
											message: `해당 정보가 갱신되었습니다.`
										})
									}
									Logger.log(`${accountSchema.cell} 지역 정보가 갱신되었습니다. (갱신자 ID:${accountSchema.id})`)
								}else{
									if(typeof callback == 'function'){
										callback({
											isSuccess: false,
											message: `통신문제로 해당 정보갱신에 실패하였습니다.`
										})
									}
								}
							}, accountSchema.id, accountSchema.cell)
						}else{
							let originPastDocumentId = originPastDocument['_id'].split('document.')[1]

							if(typeof originPastDocument['id'] != 'undefined')
								delete originPastDocument['id']
							originPastDocument.data = accountSchema.data

							// 중요 변경 시에만 전파자 명 갱신
							if(isImportantUpdate)
								originPastDocument.account = accountSchema.id

							global.Metadata.document.update(originPastDocumentId, originPastDocument, (isSuccess)=>{
								if(!isSuccess){
									if(typeof callback == 'function'){
										callback({
											isSuccess: false,
											message: `DB문제로 해당 정보갱신에 실패하였습니다.`
										})
									}
								}else{
									if(typeof callback == 'function'){
										callback({
											isSuccess: true,
											message: `해당 정보가 갱신되었습니다.`
										})
									}
									Logger.log(`${accountSchema.cell} 지역 정보가 갱신되었습니다. (갱신자 ID:${accountSchema.id})`)
								}
							})
						}
					})
				}
			})
		})
	})
}

export default function AreaDataUpdate(app, database) {
	app.post(`/api/areadata-update`, (request, response)=>{
		let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()
		let accountSchema = request.body
		if(accountSchema === undefined || accountSchema === null) return

		if(!SchemaCheck(response, accountSchema, ['id', 'pw', 'peerId', 'cell', 'data'], `관리지역푸시정보갱신`, `AreaDataUpdate`)) return

		Update(accountSchema, peerAddress, (schema)=>{
			response.send(schema)
			response.end()
		})
	})
}