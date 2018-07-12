import {SchemaCheck} from '../common/common.js'
import {Authorize} from '../common/account.js'
import Logger from '../../logger.js'

export function Check(accountSchema, peerAddress, questionCallback){
	Authorize(
		accountSchema.id, accountSchema.pw,
		peerAddress, accountSchema.peerId,
		accountSchema.channelId, null,

	(isExist, isLogined, isPwMatch, isMember, isManager, isChannelPwMatch, requesterAccountSchema)=>{

		if(!isExist || !isPwMatch){
			if(typeof questionCallback == 'function')
				questionCallback({
					isSuccess: false,
					message: `계정정보가 일치하지 않으므로 처리할 수 없습니다.`
				})
		}

		global.Metadata.metadata.get(`overpower`, (isSuccess, data)=>{
			// OP일 경우
			if(data.indexOf(accountSchema.id) !== -1){
				if(typeof questionCallback == 'function')
					questionCallback({
						isSuccess: true,
						message: `최상위 사용권한이 확인되었습니다.`
					})
				return
			}

			// 해당지역 매니저일 경우
			global.Metadata.channel.isManager(accountSchema.cell, accountSchema.id, (isSuccess)=>{
				if(!isSuccess){
					if(typeof questionCallback == 'function')
						questionCallback({
							isSuccess: false,
							message: `아직 권한이 허용 되지 않은 계정입니다.\n이후 관리자의 승인을 기다려주세요.`
						})
				} else {
					if(typeof questionCallback == 'function')
						questionCallback({
							isSuccess: true,
							message: `사용권한이 확인되었습니다.`
						})
				}
			})
		})

	})
}

export default function AuthorizeCheck(app, database) {
	app.post(`/api/authorize-check`, (request, response)=>{
		let accountSchema = request.body
		let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()
		if(accountSchema === undefined || accountSchema === null) return

		if(!SchemaCheck(response, accountSchema, ['id', 'pw', 'peerId', 'cell'], `관리자권한 보유여부`, `AuthorizeCheck`)) return

		Check(accountSchema, peerAddress, (resp)=>{
			response.send(resp)
			response.end()
		})
	})
}