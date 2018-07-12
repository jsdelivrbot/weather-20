import {SchemaCheck} from '../common/common.js'
import {Authorize} from '../common/account.js'
import Logger from '../../logger.js'


export default function SubtitleDelete(app, database) {
	app.post(`/api/subtitle-delete`, (request, response)=>{
		let accountSchema = request.body
		let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()
		if(accountSchema === undefined || accountSchema === null) return
		
		if(!SchemaCheck(response, accountSchema, ['id', 'pw', 'peerId', 'context'], `자막삭제`, `SubtitleDelete`)) return

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
							message: `지역관리자는 최고관리자의 알림내용을 삭제할 수 없습니다.`
						})
						response.end()
						return
					}

					global.Metadata.metadata.get(`subtitle`, (isSuccess, subtitleData)=>{
						if(subtitleData === null || subtitleData === undefined)
							subtitleData = []
						let contextIndex = -1
						if(typeof accountSchema['context'] == 'string'){
							contextIndex = subtitleData.indexOf(accountSchema['context'])
							subtitleData.splice(contextIndex, 1)
						}
						global.Metadata.metadata.set(`subtitle`, subtitleData, (isSuccess)=>{
							if(contextIndex !== -1){
								Logger.log(`자막이 삭제되었습니다. (작성자:${accountSchema.id}) (내용:${accountSchema['context']})`, `[Backend:SubtitleWrite]`)
								response.send({
									isSuccess: true,
									message: `해당 자막이 서버에 성공적으로 삭제되었습니다.`,
									subtitleData: subtitleData
								})
							}else{
								response.send({
									isSuccess: true,
									message: `해당 자막이 이미 서버에서 삭제되어 있습니다.`,
									subtitleData: subtitleData
								})
							}
							

							response.end()
						})
					})
				})
			}
		)
	})
}