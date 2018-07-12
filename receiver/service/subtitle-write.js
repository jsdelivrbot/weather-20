import {SchemaCheck} from '../common/common.js'
import {Authorize} from '../common/account.js'
import Logger from '../../logger.js'

import {Check} from './authorize-check.js'
import {Read} from './areadata-read.js'
import {Update} from './areadata-update.js'

export default function SubtitleWrite(app, database) {
	app.post(`/api/subtitle-write`, (request, response)=>{
		let accountSchema = request.body
		let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()
		if(accountSchema === undefined || accountSchema === null) return

		if(!SchemaCheck(response, accountSchema, ['id', 'pw', 'peerId', 'context'], `자막추가`, `SubtitleWrite`)) return

		// 입력받은 계정정보의 권한을 확인합니다.
		Authorize(
			accountSchema.id, accountSchema.pw,
			peerAddress, accountSchema.peerId,
			accountSchema.channelId, null,

			(isExist, isLogined, isPwMatch, isMember, isManager, isChannelPwMatch, requesterAccountSchema)=>{

				// 암호가 맞는지만 확인
				if(!isExist || !isPwMatch){
					response.send({
						isSuccess: false,
						message: `관리자 권한이 일치하지 않으므로 처리할 수 없습니다.`
					})
					response.end()
					return
				}

				let preSubtitle = null
				if(typeof accountSchema['context'] == 'string'){
					preSubtitle = `[${accountSchema.id}] ${accountSchema['context']}`

				global.Metadata.metadata.get(`overpower`, (isSuccess, data)=>{
					accountSchema.cell = requesterAccountSchema.selectedControlArea.cellNumber
					Check(accountSchema, peerAddress, (localCheck)=>{
						let isRootAdmin = data.indexOf(accountSchema.id) !== -1
						let isLocalAdmin = localCheck.isSuccess
						if(!isRootAdmin){
							if(isLocalAdmin){
								Read(accountSchema.cell, (plain)=>{

									// 지역 채널이 생성된 경우만 작동
									if(plain.isSuccess){

										let plainSchema = null
										try{
											plainSchema = plain.data.data
										}catch(e){}

										if(preSubtitle != null)
											plainSchema.subtitles.push(`[*지역] ${preSubtitle}`)

										accountSchema.data = plainSchema
										Update(accountSchema, peerAddress, (updatedSchema)=>{
											plain.data.data = plainSchema
											updatedSchema.localSubtitleData = plain
											response.send(updatedSchema)
											response.end()
										})
									}else{
										response.send({
											isSuccess: false,
											message: `DB에서 해당 지역정보 접근할 수 없습니다.\n관리자에게 문의해주세요.`
										})
									}
								})
								return
							}

							response.send({
								isSuccess: false,
								message: `관리자 권한이 확인되지 않으므로 처리할 수 없습니다.`
							})
							response.end()
							return
						}

						global.Metadata.metadata.get(`subtitle`, (isSuccess, subtitleData)=>{
							if(subtitleData === null || subtitleData === undefined)
								subtitleData = []
							if(preSubtitle !== null)
								subtitleData.push(`[*전국] ${preSubtitle}`)
							global.Metadata.metadata.set(`subtitle`, subtitleData, (isSuccess)=>{
								Logger.log(`자막이 추가되었습니다. (작성자:${accountSchema.id}) (내용:${accountSchema['context']})`, `[Backend:SubtitleWrite]`)

								response.send({
									isSuccess: true,
									message: `해당 자막이 서버에 성공적으로 추가되었습니다.`,
									subtitleData
								})

								response.end()
							})
						})
					})
				})
			}
		})
	})
}