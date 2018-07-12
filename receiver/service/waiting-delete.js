import {SchemaCheck} from '../common/common.js'
import {Authorize} from '../common/account.js'
import Logger from '../../logger.js'

export default function WaitingDelete(app, database) {
	app.post(`/api/waiting-delete`, (request, response)=>{
		let accountSchema = request.body
		let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()
		if(accountSchema === undefined || accountSchema === null) return

		if(!SchemaCheck(response, accountSchema, ['id', 'pw', 'peerId', 'targetid'], `승인대기자삭제`, `WaitingDelete`)) return

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
							//
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
									// 해당 ID 정보도 DB 상에서 삭제처리
									global.Metadata.account.unregister({id: accountSchema['targetid']}, (isSuccess, status)=>{
										if(isSuccess){
											Logger.log(`승인대기자를 DB에서 탈퇴처리 하였습니다. (ID: ${accountSchema['targetid']})`)
										}else{
											Logger.log(`승인대기자를 DB에서 탈퇴처리 하지 못했습니다 이미 탈퇴됨. (${accountSchema['targetid']})`)
										}
									})
									
									response.send({
										isSuccess: true,
										message: '해당 ID를 승인대기자 목록에서 삭제하였습니다.',
										waitingData
									})
									Logger.log(`승인대기자 거절요청이 처리되었습니다. (요청자:${accountSchema.id}) (대상자:${accountSchema['targetid']})`)
								})
							}else{
								response.send({
									isSuccess: false,
									message: '해당 ID가 승인대기자 목록에 존재하지 않습니다.'
								})
								Logger.log(`승인대기자 거절요청이 처리실패하였습니다. 미존재. (요청자:${accountSchema.id}) (대상자:${accountSchema['targetid']})`)
							}
							return
						}

						response.send({
							isSuccess: false,
							message: '승인 거절할 대상ID가 지정되지 않았습니다.'
						})
						response.end()
					})
				})
			}
		)
	})
}