import {SchemaCheck} from '../common/common.js'
import {Authorize} from '../common/account.js'
import Logger from '../../logger.js'

export function Delete(accountSchema, peerAddress, callback){
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
			// OP일 경우
			if(data.indexOf(accountSchema.id) !== -1){
				if(typeof callback == 'function'){
					callback({
						isSuccess: true,
						message: `최상위 사용권한이 확인되었습니다.`
					})
				}
				return
			}

			// 해당지역 매니저일 경우
			global.Metadata.channel.isManager(accountSchema.cell, accountSchema.id, (isSuccess)=>{
				if(!isSuccess){
					if(typeof callback == 'function'){
						callback({
							isSuccess: false,
							message: `아직 권한이 허용 되지 않은 계정입니다.\n이후 관리자의 승인을 기다려주세요.`
						})
					}
				} else {
					// 채널 게시글 정보 존재 검증용
					global.Metadata.channel.getLatestDocumentNumber(accountSchema.cell, (isSuccess, latest)=>{
						if(latest === 0 || latest === null){

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
							// 만약 id가 0이 아니면 해당 게시글 읽어와서 업데이트
							global.Metadata.document.update(latest, {
								context: '',
								timestamp: '',
								data: accountSchema.data,
								account: accountSchema.id,
								channel: accountSchema.cell
							}, (isSuccess)=>{
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
	app.post(`/api/areadata-delete`, (request, response)=>{
		let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()
		let accountSchema = request.body
		if(accountSchema === undefined || accountSchema === null) return

		if(!SchemaCheck(response, accountSchema, ['id', 'pw', 'peerId', 'cell', 'data'], `관리지역푸시삭제갱신`, `AreaDataDelete`)) return

		Delete(accountSchema, peerAddress, (schema)=>{
			response.send(schema)
			response.end()
		})
	})
}