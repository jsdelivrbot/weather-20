import {SchemaCheck} from '../common/common.js'
import {Authorize} from '../common/account.js'
import Logger from '../../logger.js'

export default function WaitingList(app, database) {
	app.post(`/api/waiting-list`, (request, response)=>{
		let accountSchema = request.body
		let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()
		if(accountSchema === undefined || accountSchema === null) return

		if(!SchemaCheck(response, accountSchema, ['id', 'pw', 'peerId'], `승인대기자목록`, `WaitingList`)) return

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

				global.Metadata.metadata.get(`overpower`, (isSuccess, data)=>{
					if(data.indexOf(accountSchema.id) === -1){
						response.send({
							isSuccess: false,
							message: `관리자 권한이 확인되지 않으므로 처리할 수 없습니다.`
						})
						response.end()
						return
					}

					global.Metadata.metadata.get(`waiting`, (isSuccess, waitingData)=>{
						if(waitingData === null || waitingData === undefined)
							waitingData = []
						response.send({
							isSuccess: true,
							waitingData
						})
						response.end()
					})
				})
			}
		)
	})
}