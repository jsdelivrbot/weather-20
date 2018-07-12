import {SchemaCheck} from '../common/common.js'
import {Authorize} from '../common/account.js'
import Logger from '../../logger.js'

export default function AdminList(app, database) {
	app.post(`/api/admin-list`, (request, response)=>{
		let accountSchema = request.body
		let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()
		if(accountSchema === undefined || accountSchema === null) return

		if(!SchemaCheck(response, accountSchema, ['id', 'pw', 'peerId'], `관리자목록조회`, `AdminList`)) return

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
				
				global.Metadata.metadata.get(`overpower`, (isSuccess, overPowerList)=>{
					let isRootAdmin = overPowerList.indexOf(accountSchema.id) !== -1
					if(!isRootAdmin){
						response.send({
							isSuccess: false,
							message: `최고관리자 권한이 확인되지 않으므로 처리할 수 없습니다.`
						})
						response.end()
						return
					}
					
					// 승인 대기자 목록 수집
					global.Metadata.metadata.get(`waiting`, (isSuccess, waitingData)=>{

						// 운영자 목록 수집
						global.Metadata.metadata.getAll(`account`, (isSuccess, accountDatas, status)=>{
							if(!isSuccess) return;

							let collectedAccountData = []
							for(let accountName of Object.keys(accountDatas)){
								let accountData = accountDatas[accountName]['_value']
								let isAccountData = true
								if(isAccountData && typeof accountData['id'] == 'undefined') isAccountData = false
								if(isAccountData && typeof accountData['pw'] == 'undefined') isAccountData = false

								if(!isAccountData) continue;
								
								let isWaitingAccount = false
								for(let waitingDataId of waitingData){
									if(waitingDataId.id == accountData.id){
										isWaitingAccount = true
										break
									}
								}
								if(isWaitingAccount) continue

								delete(accountData.pw)
								delete(accountData.logined)
								collectedAccountData.push(accountData)
							}
							response.send({
								isSuccess: true,
								message: ``,
								data: collectedAccountData
							})
							response.end()
						})
					})
				})
			}
		)
	})
}