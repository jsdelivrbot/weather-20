import request from 'request'
import moment from 'moment'
import {parseString} from 'xml2js'
import {findRootAddress} from './address.js'
import Logger from '../../logger.js'

import path from 'path'
import fs from 'fs'

let dustJSONPath = path.join(process.cwd(), '/resources/data/dust.json')
let dustStationDatas = JSON.parse(fs.readFileSync(dustJSONPath, 'utf8'))

let utc = `+09:00`
let serviceKey = `serviceKey=ZyS8WG8B9gda%2Bb3A4S2rjydFD2SOjrXYAjJpzVoO2Kx4WEiAngX6sFixyUW9g1KbIskw%2FiwW5K%2FJ%2Bzbl7XRQjg%3D%3D`

// 실시간 대기질 요청코드
let liveDataUrl = `http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?`

// 서비스 키
liveDataUrl += serviceKey

// 기본 요청설정
liveDataUrl += `&numOfRows=10&pageSize=10&pageNo=1&startPage=1&dataTerm=DAILY&ver=1.3`

let rootDataUrl = `http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getMinuDustFrcstDspth?`
rootDataUrl += serviceKey
rootDataUrl += `&numOfRows=10&pageSize=10&pageNo=1&startPage=1&InformCode=PM10`


//dustStationData
export function findStation(paramLat, paramLong){
	let lat = Number(paramLat)
	let long = Number(paramLong)

	let foundedStationData = null
	
	let near = []
	for(let dustStationData of dustStationDatas){
		let coordDiff = 0
		coordDiff += Math.abs(lat - dustStationData['x'])
		coordDiff += Math.abs(long - dustStationData['y'])

		

		// 지원대상이 적으면 배제
		if(dustStationData['supportTypes'].indexOf('PM10') == -1) continue
		if(dustStationData['supportTypes'].indexOf('PM2.5') == -1) continue
		if(dustStationData['supportTypes'].indexOf('NO2') == -1) continue
		if(dustStationData['supportTypes'].indexOf('O3') == -1) continue
		if(dustStationData['supportTypes'].indexOf('CO') == -1) continue
		if(dustStationData['supportTypes'].indexOf('SO2') == -1) continue

		// 측정소 위치가 교외지역이면 배제
		// if(dustStationData['dataType'] == '교외대기') continue

		// TODO
		// 초미세먼지 데이터는 따로 요청
		// 교외대기

		if(foundedStationData === null || foundedStationData.diff > coordDiff){
			dustStationData.diff = coordDiff
			foundedStationData = dustStationData
		}
	}
	if(typeof foundedStationData['diff'] !== 'undefined')
		delete foundedStationData['diff']
	return foundedStationData
}

export function RequestRootData(database, callback){
	database.metadata.get(`dust.root`, (isSuccess, data)=>{
		// 기존 데이터가 없는 경우 또는
		// 데이터 다운로드 시점으로부터 1시간이 지난 경우
		if(!isSuccess || data === null
		   || data === undefined ||
		  (typeof data === 'object'
		   && typeof data['timestamp'] !== 'undefined'
		   && moment(Number(data['timestamp'])).add(1, 'hours') <= moment()) ){

			try{
				// 기상청에서 해당 지역 데이터를 받아옵니다.
				let netHandle = request(`${rootDataUrl}&searchDate=${encodeURIComponent(moment().utcOffset(utc).format(`YYYY-MM-DD`))}`, (error, response, body) => {

					// JSON 형태로 변환합니다.
					parseString(body, (err, result) => {
						if(result === undefined || result === null || typeof result['response'] === 'undefined' || typeof result.response.body[0].items[0]['item'] === 'undefined'){
							console.log('데이터 획득실패')
							return
						}

						let parsedRootDatas = []
						for(let item of result.response.body[0].items[0].item){
							let parsedRootData = {}
							parsedRootData.description = item.informOverall[0]
							parsedRootData.reason = item.informCause[0]
							parsedRootData.time = item.informData[0]

							parsedRootData.pm10in09Img = item.imageUrl1[0]
							parsedRootData.pm10in15Img = item.imageUrl2[0]
							parsedRootData.pm10in21Img = item.imageUrl3[0]

							parsedRootData.pm2_5in09Img = item.imageUrl1[0]
							parsedRootData.pm2_5in15Img = item.imageUrl2[0]
							parsedRootData.pm2_5in21Img = item.imageUrl3[0]

							let parseGrade = item.informGrade[0].split(`,`)
							let parsedGrade = {}
							for(let parseGradeIndex in parseGrade){
								let parsedGradeItems = parseGrade[parseGradeIndex].split(` : `)
								parsedGrade[parsedGradeItems[0]] = parsedGradeItems[1]
							}

							parsedRootData.grade = parsedGrade
							parsedRootDatas.push(parsedRootData)
						}

						Logger.log(`한국환경공단으로부터 전국 대기오염 예상 데이터를 받아왔습니다.`)

						database.metadata.set(`dust.root`, parsedRootDatas)

						if(typeof callback === 'function')
							callback(parsedRootDatas)
					})
				})
				netHandle.on('error', (err) => {
					console.log(`ERROR: ${err}`)
				})

			}catch(e){
				// 확인할 수 없는 정보임을 클라이언트에 알립니다.
				if(typeof callback === 'function')
					callback(null)
			}
			return
		}

		// 입력되어 있는 날씨 값을 콜백에 전달합니다.
		if(typeof callback === 'function')
			callback(data)
	})
}

export function RequestStationData(database, paramLat, paramLong, callback){
	let station = findStation(paramLat, paramLong)
	database.metadata.get(`dust.station.${station.name}`, (isSuccess, data)=>{

		// 기존 데이터가 없는 경우 또는
		// 데이터 다운로드 시점으로부터 1시간이 지난 경우
		if(!isSuccess || data === null
		   || data === undefined ||
		  (typeof data === 'object'
		   && typeof data['timestamp'] !== 'undefined'
		   && moment(Number(data['timestamp'])).add(1, 'hours') <= moment()) ){

			let parsedDustStationData = []

			try{
				// 기상청에서 해당 지역 데이터를 받아옵니다.
				request(`${liveDataUrl}&stationName=${encodeURIComponent(station.name)}`, (error, response, body) => {

					// JSON 형태로 변환합니다.
					parseString(body, (err, result) => {
						if(result === null || result === undefined || typeof result['response'] === 'undefined' || typeof result.response.body[0].items[0]['item'] === 'undefined'){
							console.log('데이터 획득실패')
							return
						}
						Logger.log(`한국환경공단으로부터 ${station.name}(${station.x}, ${station.y}) 측정소 대기오염 데이터를 받아왔습니다.`)

						for(let item of result.response.body[0].items[0].item){
							let itemData = {
								name: item.dataTime[0],
								dataType: item.mangName[0],
							}

							let innerAdd = (innerNames)=>{
								for(let innerName of innerNames)
									if(typeof item[innerName] !== 'undefined')
										itemData[innerName] = item[innerName][0]
							}

							innerAdd(['so2Value',
									  'coValue',
									  'o3Value',
									  'no2Value',
									  'pm10Value',
									  'pm10Value24',
									  'pm25Value',
									  'pm25Value24',
									  'khaiGrade',
									  'so2Grade',
									  'coGrade',
									  'o3Grade',
									  'no2Grade',
									  'pm10Grade',
									  'pm25Grade',
									  'pm10Grade1h',
									  'pm25Grade1h'])

							parsedDustStationData.push(itemData)
						}

						// 11번째 데이터로 측정소 정보추가
						parsedDustStationData.push(station)

						database.metadata.set(`dust.station.${station.name}`, parsedDustStationData)

						if(typeof callback === 'function')
							callback(parsedDustStationData)
					})
				})

			}catch(e){
				// 확인할 수 없는 정보임을 클라이언트에 알립니다.
				if(typeof callback === 'function')
					callback(null)
			}
			return
		}

		// 입력되어 있는 날씨 값을 콜백에 전달합니다.
		if(typeof callback === 'function')
			callback(data)
	})
}

export default function Dust(app, database) {
	app.post(`/api/dust`, (request, response)=>{
		let requestSchema = request.body
		if(requestSchema === undefined || requestSchema === null) return

		if(typeof requestSchema['x'] !== 'undefined'
			|| typeof requestSchema['y'] !== 'undefined'){

			// 좌표 정보가 있으면 해당 좌표정보 숫자로 반환
			let x = Number(requestSchema['x'])
			let y = Number(requestSchema['y'])

			if(typeof requestSchema['type'] !== 'undefined'){
				if(requestSchema['type'] == '3days'){
					RequestRootData(database, (dailyDataSchema)=>{
						response.send({
							address: findRootAddress(x, y),
							data: dailyDataSchema
						})
						response.end()
					})
				}
				return
			}

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