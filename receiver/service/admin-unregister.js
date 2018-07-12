import {SchemaCheck} from '../common/common.js'
import {Authorize} from '../common/account.js'
import Logger from '../../logger.js'

export default function AdminUnregister(app, database) {
	app.post(`/api/admin-unregister`, (request, response)=>{
		let accountSchema = request.body
		let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()
		if(accountSchema === undefined || accountSchema === null) return

		if(!SchemaCheck(response, accountSchema, ['id', 'pw', 'peerId', 'targetid'], `관리자탈퇴처리`, `AdminUnregister`)) return

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

					// 운영자 목록 수집
					global.Metadata.metadata.getAll(`account`, (isSuccess, accountDatas, status)=>{
						if(!isSuccess) return;

						let targetId = null
						let targetIdData = null
						if(typeof accountSchema['targetid'] == 'string')
							targetId = accountSchema['targetid']

						let collectedAccountData = []
						if(targetId === null){
							response.send({
								isSuccess: false,
								message: `탈퇴 처리할 대상 ID가 지정되지 않았습니다.`
							})
							response.end()
							return
						}
						
						for(let accountName of Object.keys(accountDatas)){
							let accountData = accountDatas[accountName]['_value']
							let isAccountData = true
							if(isAccountData && typeof accountData['id'] == 'undefined') isAccountData = false
							if(isAccountData && typeof accountData['pw'] == 'undefined') isAccountData = false

							if(!isAccountData) continue
							delete(accountData.pw)
							delete(accountData.logined)
							collectedAccountData.push(accountData)

							if(accountData['id'] == targetId)
								targetIdData = accountData
						}
						
						if(targetIdData === null){
							response.send({
								isSuccess: false,
								message: `탈퇴 처리할 회원정보를 찾을 수 없습니다.`
							})
							response.end()
							return
						}

						// 아래 데이터를 삭제 후 DB 반영할 데이터 구성
						let isAlreadResponsed = false
						global.Metadata.metadata.change(`account.${targetIdData.id}`,
							(isSuccess, data, status)=>{
								if(!isSuccess && !isAlreadResponsed){
									isAlreadResponsed = true
									response.send({
										isSuccess: false,
										message: `내부 DB문제로 인해 해당 회원정보를 삭제하는데 실패했습니다.`
									})
									response.end()
									return
								}
								if(data === null || data === undefined){
									if(!isAlreadResponsed){
										isAlreadResponsed = true
										response.send({
											isSuccess: false,
											message: `탈퇴 처리할 회원정보를 찾을 수 없습니다.`
										})
										response.end()
									}
									return
								}
								return {
									act: 'unset',
									data: targetIdData
								}
							},(isSuccess, resolve)=>{
								if(!isSuccess && !isAlreadResponsed){
									isAlreadResponsed = true
									response.send({
										isSuccess: false,
										message: `내부 DB문제로 인해 해당 회원정보를 삭제하는데 실패했습니다.`
									})
									response.end()
									resolve()
									return
								}
								
								// 유저에게 전송할 목록데이터 구성
								// collectedAccountData
								for(let collectedAccountDataIndex in collectedAccountData){
									let collectedAccountDataItem = collectedAccountData[collectedAccountDataIndex]
									if(typeof collectedAccountDataItem.id === 'undefined')
										continue
									if(collectedAccountDataItem.id == targetIdData.id){
										delete collectedAccountData[collectedAccountDataIndex]
										break
									}
								}
								if(!isAlreadResponsed){
									response.send({
										isSuccess: true,
										message: `정상적으로 해당인원을 탈퇴처리 하였습니다.`,
										adminList: collectedAccountData
									})
									response.end()
								}
								resolve()

							}
						)

					})
				})
			}
		)
	})
}