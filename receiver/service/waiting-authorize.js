import {SchemaCheck} from '../common/common.js'
import {Authorize} from '../common/account.js'
import Logger from '../../logger.js'

export default function WaitingAuthorize(app, database) {
	app.post(`/api/waiting-authorize`, (request, response)=>{
		let accountSchema = request.body
		let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()
		if(accountSchema === undefined || accountSchema === null) return

		if(!SchemaCheck(response, accountSchema, ['id', 'pw', 'peerId', 'targetid' ,'cell'], `승인대기자허용`, `WaitingAuthorize`)) return

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
						
						if(typeof accountSchema['targetid'] == 'string'){

							let targetIndex = -1
							for(let findDataIndex in waitingData){
								let findData = waitingData[findDataIndex]
								if(findData.id === accountSchema['targetid']){
									targetIndex = findDataIndex
									break
								}
							}

							if(targetIndex !== -1){
								waitingData.splice(targetIndex, 1)
								global.Metadata.metadata.set(`waiting`, waitingData, (isSuccess)=>{

									let cellNumber = accountSchema.cell

									// 채널 생성여부 확인 후
									global.Metadata.channel.isRegistered(cellNumber, (isExist)=>{
										
										let innerAdminSign = ()=>{
											global.Metadata.channel.sign(cellNumber, accountSchema.targetid, (isSuccess, status)=>{

												// 관리지역 가입 
												if(isSuccess){
													response.send({
														isSuccess: true,
														message: '해당 ID를 해당지역 관리자로 설정하였습니다.',
														waitingData
													})
													Logger.log(`승인대기자 승인요청이 처리되었습니다. (요청자:${accountSchema.id}) (대상자:${accountSchema['targetid']})`, `[Backend:WaitingAuthorize]`)
												}else{
													let innerMessage = status

													if(innerMessage == `Not exist collection`)
														innerMessage = `해당 지역정보 저장에 문제가 있습니다.\n관리자에게 문의해주시기 바랍니다.`

													if(innerMessage == `Already Added`)
														innerMessage = `이미 지역 관리자로 추가되어 있습니다.`
														
													if(innerMessage == `Update failed`)
														innerMessage = `해당 요청처리에 문제가 있습니다.\n관리자에게 문의해주시기 바랍니다.`

													response.send({
														isSuccess: false,
														message: innerMessage
													})
													Logger.log(`승인대기자 승인요청에 실패 하였습니다. (요청자:${accountSchema.id}) (대상자:${accountSchema['targetid']})`, `[Backend:WaitingAuthorize]`)
													Logger.log(innerMessage)
												}
											})
										}
										
										// 만약 지역정보가 없으면 생성
										if(!isExist){
											Logger.log(`지역푸시채널이 DB상에 생성되었습니다. 셀넘버 ${cellNumber}`, `[Backend:WaitingAuthorize]`)

											global.Metadata.channel.register({
												id: cellNumber
											}, (isSuccess, message)=>{

												// 관리자정보 추가
												innerAdminSign()
											})
										}else{
											
											// 관리자 정보만 추가
											innerAdminSign()
										}
									})
								})
							}else{
								response.send({
									isSuccess: false,
									message: '해당 ID가 승인대기자 목록에 존재하지 않습니다.'
								})
								Logger.log(`승인대기자 승인요청이 처리실패하였습니다. 미존재. (요청자:${accountSchema.id}) (대상자:${accountSchema['targetid']})`, `[Backend:WaitingAuthorize]`)
							}
							return
						}

						response.send({
							isSuccess: false,
							message: '승인할 대상ID가 지정되지 않았습니다.'
						})
						response.end()
					})
				})
			}
		)
	})
}