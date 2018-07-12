import request from 'request'
import moment from 'moment'
import {parseString} from 'xml2js'
import {findRootAddress} from './address.js'
import Logger from '../../logger.js'

import path from 'path'
import fs from 'fs'

let utc = `+09:00`

// 실시간 산불위험지수 요청코드
let serviceKey = `8264322445659341787630073214829538214954`
let liveDataUrl = `http://know.nifos.go.kr/openapi/forestPoint/forestPointListSearch.do?localArea=11,27,30,42,46,47,36,29,31,44,45,50,26,28,41,43,48&gubun=sido&keyValue=${serviceKey}&version=1.1&excludeForecast=1`

let codeData = {
	서울특별시: [37.563370, 126.993000],
	부산광역시: [35.177930, 129.078500],
	대구광역시: [35.854020, 128.610300],
	인천광역시: [37.456260, 126.705200],
	광주광역시: [35.159550, 126.852600],
	대전광역시: [36.334490, 127.437300],
	울산광역시: [35.538270, 129.313300],
	세종특별자치시: [36.505910, 127.251900],
	경기도: [37.407250, 127.430000],
	강원도: [37.500000, 128.250000],
	충청북도: [36.750000, 127.750000],
	충청남도: [36.500000, 126.750000],
	전라북도: [35.817000, 127.150000],
	전라남도: [34.750000, 127.000000],
	경상북도: [36.250000, 128.750000],
	경상남도: [35.250000, 128.250000],
	제주특별자치도: [33.474980, 126.530700]
}

export function findAddress(paramLat, paramLong){
	let lat = Number(paramLat)
	let long = Number(paramLong)

	let foundData = null

	for(let rootAddressName in codeData){
		let rootAddress = codeData[rootAddressName]

		let coordDiff = 0
		coordDiff += Math.abs(lat - rootAddress[0])
		coordDiff += Math.abs(long - rootAddress[1])

		if(foundData === null || foundData.diff > coordDiff){
			foundData = {
				name: rootAddressName,
				x: rootAddress[0],
				y: rootAddress[1],
				diff: coordDiff
			}
		}
	}
	return foundData.name
}

export function RequestStationData(database, paramLat, paramLong, callback){
	let stationName = findAddress(paramLat, paramLong)
	database.metadata.get(`forest.station.${stationName}`, (isSuccess, data)=>{

		// 기존 데이터가 없는 경우 또는
		// 데이터 다운로드 시점으로부터 1시간이 지난 경우
		if(!isSuccess || data === null
		   || data === undefined ||
		  (typeof data === 'object'
		   && typeof data['timestamp'] !== 'undefined'
		   && moment(Number(data['timestamp'])).add(1, 'hours') <= moment()) ){

			let parsedStationDatas = {}

			try{
				// 기상청에서 해당 지역 데이터를 받아옵니다.
				request(liveDataUrl, (error, response, body) => {

					// JSON 형태로 변환합니다.
					parseString(body, (err, result) => {
						if(result === null || result === undefined || typeof result['metadata'] === 'undefined'){
							Logger.log('데이터 획득실패', `[Backend:Forest]`)
							return
						}
						for(let item of result.metadata.outputData[0].items){
							let parsedStationName = item['$']['doname']
							/*
							d1[0] 낮음 !== 0
							d2[0] 보통
							d3[0] 높음
							d4[0] 위험
							*/
							let indexGrade = '낮음'
							if(item['d1'][0] != '0'){
								indexGrade = '낮음'
							}else if(item['d2'][0] != '0'){
								indexGrade = '보통'
							}else if(item['d3'][0] != '0'){
								indexGrade = '높음'
							}else if(item['d4'][0] != '0'){
								indexGrade = '위험'
							}
							let parsedStationData = {
								stationName: parsedStationName,
								stationCode: item['$']['regioncode'],
								broadcastDate: item['analdate'][0],
								index: item['meanavg'][0],
								grade: indexGrade
							}
							parsedStationDatas[parsedStationName] = parsedStationData
						}
						//console.log(parsedStationDatas)

						let dataSchema = {
							timestamp: (new Date()).getTime(),
							data: parsedStationDatas
						}
						database.metadata.set(`forest.station.${stationName}`, dataSchema)
						Logger.log(`산림청에서 ${stationName} 산불위험지수 정보를 얻어왔습니다.`, `[Backend:Forest]`)
	
						if(typeof callback === 'function')
							callback(parsedStationDatas[stationName])
					})
				})

			}catch(e){
				Logger.log(`산림청에서 ${stationName} 산불위험지수 정보를 얻어오는데 실패했습니다.`, `[Backend:Forest]`)
				console.log(e)

				// 확인할 수 없는 정보임을 클라이언트에 알립니다.
				if(typeof callback === 'function')
					callback(null)
			}
			return
		}

		// 입력되어 있는 날씨 값을 콜백에 전달합니다.
		let callbackData = null
		if(typeof data['data'] != 'undefined')
			callbackData = data['data'][stationName]
		if(typeof callback === 'function')
			callback(callbackData)
	})
}

export default function Forest(app, database) {
	app.post(`/api/forest`, (request, response)=>{
		let requestSchema = request.body
		if(requestSchema === undefined || requestSchema === null) return

		if(typeof requestSchema['x'] !== 'undefined'
			|| typeof requestSchema['y'] !== 'undefined'){

			// 좌표 정보가 있으면 해당 좌표정보 숫자로 반환
			let x = Number(requestSchema['x'])
			let y = Number(requestSchema['y'])

			RequestStationData(database, x, y, (dailyDataSchema)=>{
				response.send(dailyDataSchema)
				response.end()
			})
			return
		}

		response.send(null)
		response.end()
	})
}