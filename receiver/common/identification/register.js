import {SchemaCheck} from '../common.js'
import Security from '../../security.js'
import Logger from '../../logger.js'
import moment from 'moment'

export default function Register(
	request, response,
	database, databaseKey,
	processId, processType){

	let accountSchema = request.body
	if(!SchemaCheck(response, accountSchema, [], `${processType}가입`, processId)) return

	let currentTime = Number(moment().format('x'))
	let peerAddress = (request.connection.remoteAddress).split(',')[0].trim()

	// 만약 peerId 정보가 있으면 바로 로그인처리
	if(typeof accountSchema.peerId != 'undefined'){
		accountSchema.logined[currentTime] = {
			peerAddress: peerAddress,
			peerId: accountSchema.peerId
		}
		delete accountSchema.peerId
	}

	// 데이터베이스에 정보입력을 시도합니다.
	database[databaseKey].register(accountSchema, (isSuccess, status)=>{
		let accountId = '[알 수없음]'
		try{ accountId = String(accountSchema.id) }catch(e){}

		// 정보입력이 실패한 경우
		if(!isSuccess){
			let responseFailMessage = `알 수 없는 문제로 인해 처리에 실패하였습니다.`

			switch(status){
				case 'Database Get Error':
				case 'Database Update Error':
					responseFailMessage = `서버 지연으로 인해 ${processType}생성 처리에 실패했습니다.`
					break
				case 'Already Registered':
					responseFailMessage = `이미 생성되어 있는 ${processType}입니다.`
					break
			}

			response.send({
				isSuccess: false,
				message: responseFailMessage})
			response.end()
			Logger.log(`${processType}생성 실패가 발생하였습니다. (ID:${accountId}) (${responseFailMessage})`, `[Backend:${processId}]`)
			return
		}

		global.Metadata.metadata.get(`overpower`, (isSuccess, overPowerList)=>{
			// 만약 오버파워가 아니면 승인대기자로 추가
			if(overPowerList.indexOf(accountSchema.id) === -1){

				// 만약 이미 승인대기자가 아닐때에만 승인대기자로 추가
				global.Metadata.metadata.get(`waiting`, (isSuccess, waitingList)=>{
					if(waitingList === null || waitingList === undefined)
						waitingList = []

					let targetSchema = {
						id: accountSchema.id,
						name: accountSchema.realName,
						workPlace: accountSchema.workLocation,
						contractNumber: accountSchema.contactNumber,
						cell: accountSchema.selectedControlArea.cellNumber,
						cellName: accountSchema.selectedControlArea.cellName
					}
					if(waitingList.indexOf(targetSchema) === -1){
						waitingList.push(targetSchema)
						global.Metadata.metadata.set(`waiting`, waitingList)
					}
				})
			}
		})

		global.Metadata.metadata.get(`overpower`, (isSuccess, data)=>{

			let isOverPower = false
			if(data !== undefined && data !== null && processType == '계정')
				if(data.indexOf(accountId) !== -1)
					isOverPower = true

			// 정보입력이 성공한 경우
			response.send({
				isSuccess:true,
				message: `${processType}생성에 성공하였습니다.`,
				isOverPower
			})
			response.end()
			Logger.log(`${processType}이 정상적으로 생성되었습니다. (ID:${accountId})`, `[Backend:${processId}]`)
		})
		
		return
	})
}