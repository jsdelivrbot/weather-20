import request from 'request'
import Logger from '../../logger.js'
import iconv from 'iconv-lite'
import moment from 'moment'
import {findAddress} from './address.js'

let utc = '+0900'

let isGlobalUpdateQueueRunning = false
let globalUpdateQueue = []

// 크롤러가 요청량을 병렬로 전송할지 여부 선택
let isGentlyWork = false

// 생활지수 정보 크롤러
export class Industry{
	constructor(app, database, option={}){
		this.isLoaded = false
		this.isLoading = false
		this.preCommandQueue = []

		this.app = app
		this.database = database
		this.option = option

		this.intervalHandle = null
		this.dataJson = null
		this.register()
	}
	
	change(paramApp){
		this.app = paramApp
		this.register()
	}

	get(database, callback){
		//if(!this.isLoaded){
		//	this.preCommandQueue.push(callback)
		//	return
		//}

		database.metadata.get(`life.${this.option.dataId}`, (isSuccess, data)=>{
			callback(data)
		})
	}

	register(){
		let self = this
		let option = self.option

		if(self.intervalHandle !== null)
			clearInterval(self.intervalHandle)

		self.app.post(`/api/${option.dataId}`, (request, response)=>{
			let requestSchema = request.body
			if(requestSchema === undefined || requestSchema === null) {
				Logger.log(`잘못된 유형의 ${option.dataName} 요청발생`, `[Backend:Industry]`)
				response.send(null)
				response.end()
				return
			}

			if(typeof requestSchema['x'] !== 'undefined'
				|| typeof requestSchema['y'] !== 'undefined'){

				// 좌표 정보가 있으면 해당 좌표정보 숫자로 반환
				let x = Number(requestSchema['x'])
				let y = Number(requestSchema['y'])

				self.get(self.database, (dataSchema)=>{
					if(dataSchema === null || dataSchema === undefined){
						response.send(null)
						response.end()
						return
					}

					try{
						let fullAddress = findAddress(x, y).key.split('.')

						let foundedAreaName = null
						let areaName = fullAddress[0]
						if(areaName !== '제주특별자치도'){
							areaName = areaName.split('특별').join('')
							areaName = areaName.split('광역').join('')
							areaName = areaName.split('자치').join('')
						}
						// 경상남도
						// 창원시 의창구
						// 용지동
						if(typeof dataSchema.data[0][areaName] == 'undefined'){
							let areaData = null
							if(typeof dataSchema.data[0]['전국'][areaName] != 'undefined'){
								areaData = dataSchema.data[0]['전국'][areaName]
								//if(option.dataId == 'uv'){
									//console.log(`전국/${areaName}`)
									//console.log(areaData)
								//}
							}else{
								//if(option.dataId == 'uv') console.log('예외상황감지')
								response.send(null)
								response.end()
								return
							}
							for(let innerDataIndex of Object.keys(areaData)){
								let itemAreaName = innerDataIndex.split('시')[0] +'시'
								if(itemAreaName == fullAddress[1]){
									foundedAreaName = innerDataIndex
									break
								}
							}
						}else{
							if(option.dataId == 'uv'){
								//console.log('부수적처리자료감지')
								//console.log(dataSchema.data)
							}
							foundedAreaName = fullAddress[1]
						}


						let fullLocalData = []
						if(foundedAreaName !== null){
							// 창원시 의창구 -> 창원시
							if(typeof foundedAreaName.split(' ')[1] != 'undefined')
								foundedAreaName = foundedAreaName.split(' ')[0]

							//if(option.dataId == 'uv') console.log(`foundedAreaName 존재: ${foundedAreaName}`)
							for(let pageNum=0;pageNum<=option.maxPageNum;pageNum++){
								if(typeof dataSchema.data[0][areaName] !== 'undefined'){
									if(option.dataId == 'uv'){
										//console.log(`CASE 1 전송 ${pageNum}/${areaName}/${foundedAreaName}`)
										
										//foundedAreaName // 남양주시
										
										//경기도 의정부
									}

									//원본코드
									//20180708
									//let targetData = dataSchema.data[pageNum][areaName][foundedAreaName]
									//fullLocalData.push(targetData)
									
									
									let targetData = dataSchema.data[pageNum][areaName]
									for(let targetDataItemIndex in targetData){
										let targetDataItem = targetData[targetDataItemIndex]
										//foundedAreaName // 의정부시
										//targetDataItemIndex // 의정부
										//console.log(`foundedAreaName:${foundedAreaName}, targetDataItemIndex:${targetDataItemIndex}, targetDataItem: ${targetDataItem}`)
										if(foundedAreaName.indexOf(targetDataItemIndex) !== -1){
											targetData = targetDataItem
											break
										}
									}
									fullLocalData.push(targetData)
								}else{
									//if(option.dataId == 'uv') console.log('CASE 2 전송')
									fullLocalData.push(dataSchema.data[pageNum]['전국'][foundedAreaName])
								}
							}
						}else{
							//if(option.dataId == 'uv') console.log(`foundedAreaName 미존재: ${foundedAreaName}`)
							for(let pageNum=0;pageNum<=option.maxPageNum;pageNum++){
								//if(option.dataId == 'uv') console.log('CASE 3 전송')
								fullLocalData.push(dataSchema.data[pageNum]['전국'][areaName])
							}
						}

						response.send(fullLocalData)
						response.end()
					}catch(e){
						response.end()
					}
				})
				return
			}

			response.send(null)
			response.end()
		})

		this.intervalHandle = setInterval(()=>{
			if(self.isLoaded || self.isLoading) return
			self.isLoading = true

			if(isGentlyWork){
				if(!isGlobalUpdateQueueRunning){
					isGlobalUpdateQueueRunning = true
					self.update(option.url,option.dataId, option.dataName,
						option.maxPageNum, option.repeatDelay, self.database)
				}else{
					globalUpdateQueue.push(()=>{
						self.update(option.url,option.dataId, option.dataName,
							option.maxPageNum, option.repeatDelay, self.database)
					})
				}
			}else{
				self.update(option.url,option.dataId, option.dataName,
					option.maxPageNum, option.repeatDelay, self.database)
			}

		}, option.repeatDelay)
	}

	update(url, dataId, dataName,
			maxPageNum, repeatDelay, database,
			callback, pageNum = 0, fullData = []){

		let self = this
		database.metadata.get(`life.${dataId}`, (isSuccess, data)=>{

			// 데이터 유효기간 만료여부 검사
			let isNeedToUpdate = false
			if(data !== null && data !== undefined
			   && typeof data === 'object'
			   && typeof data['timestamp'] !== 'undefined' && !isNaN(data['timestamp'])){

				let downloadTime = moment(Number(data['timestamp'])).utcOffset(utc)

				// 18일 01시에 받았는데 19일 07시 까지 대기할 수 있으므로,
				// 18일 01시는 17일01시로 책정, 그러면 18일 07시에 정상작동함
				if(downloadTime.get('hour') < self.option.updateHour)
					downloadTime.add(-1, 'days')

				// 데이터 다운로드 시점의 일로부터
				// 다음날 07시가 오늘보다 과거면 업데이트 true
				let updateTime = moment(downloadTime).add(1, 'days').set('hour', self.option.updateHour).set('minute', 0).set('second', 0)
				if(updateTime <= moment().utcOffset(utc)) isNeedToUpdate = true
			}

			// 기존 정상 데이터가 없는 경우 또는
			// 유효기간이 만료된 경우 최신화
			if(!isSuccess || data === null
			   || data === undefined || isNeedToUpdate){

				// 최초 pageNum 이 0일 때만
				// 해당 일자 dataJson 획득
				if(pageNum == 0){

					request({
						uri: self.option.dataJsonUrl,
						rejectUnauthorized: false,
						encoding: null

					}, (err, response, body)=>{
						Logger.log(`기상청에서 ${dataName} 지도화용 정보를 받아왔습니다.`, `[Backend:Industry]`)

						// 값 해석을 시작합니다.
						body = iconv.decode(body, 'EUC-KR').toString()
						try{
							self.dataJson = eval(body.split(`var ${self.option.dataJsonName} = `)[1].split(`;`)[0])
						}catch(e){
							Logger.log(`기상청에서 받아온 ${dataName} 지도화용 정보를 해석하는데 실패했습니다.`, `[Backend:Industry]`)
							console.log(e)
						}
					})
				}

				request({
					uri: `${url}&point=${pageNum}`,
					rejectUnauthorized: false,
					encoding: null

				}, (err, response, body)=>{
					Logger.log(`기상청에서 ${dataName} 정보를 받아왔습니다. (${pageNum}/${maxPageNum})`, `[Backend:Industry]`)

					// 값 해석을 시작합니다.
					try{
						body = iconv.decode(body, 'EUC-KR').toString()
						let parsedBody = body.split('</thead>')[1].split('</table>')[0]

						let toppestAreaName = '전국'
						let areaData = {}

						areaData[toppestAreaName]= {}
						for(let tr of parsedBody.split('<tr>')){

							// 도시군별 최상위 값
							if(tr.indexOf(`<th colspan="6">`) !== -1){
								let topName = tr.split(`<th colspan="6">`)[1].split('</th>')[0]
								toppestAreaName = topName
								areaData[toppestAreaName]= {}
								continue
							}

							// 최하위 아이템 값
							// !:패턴 중요 값이 3개씩 존재
							tr = tr.split('</tr>')[0]

							let parseTR = tr.split('<th>')
							for(let itemLevel=0; itemLevel<=parseTR.length-1; itemLevel++){
								let item = tr.split('<th>')[itemLevel].split('</td>')[0]

								if(typeof item != 'string') continue
								if(item.indexOf(`nbsp`) != -1) continue
								if(item.indexOf(`</th>`) == -1) continue

								item = item.split(`\n`).join('').split('</th><td>')
								areaData[toppestAreaName][item[0]] = item[1]
							}
						}

						fullData.push(areaData)

						if(pageNum === maxPageNum){
							let dataSchema = {
								timestamp: (new Date()).getTime(),
								data: fullData,
								map: self.dataJson
							}
							database.metadata.set(`life.${dataId}`, dataSchema)

							if(typeof callback === 'function')
								callback(dataSchema)

							for(let preCommand of self.preCommandQueue)
								if(typeof preCommand === 'function')
									preCommand(dataSchema)

							self.preCommandQueue = []
							self.isLoaded = true
							self.isLoading = false
							Logger.log(`기상청에서 ${dataName} 정보를 모두 받아왔습니다.`, `[Backend:Industry]`)

							// 모든 글로벌 업데이트가 끝났다면
							if(isGentlyWork){
								if(globalUpdateQueue.length == 0){
									isGlobalUpdateQueueRunning = false
									return
								}

								// 글로벌 업데이트가 남아있다면
								let nextUpdateWork = globalUpdateQueue.shift()
								nextUpdateWork()
							}
							return
						}
					}catch(e){
						Logger.log(`기상청에서 받아온 ${dataName} 지도화용 정보를 일부 해석하는데 실패했습니다.`, `[Backend:Industry]`)
						console.log(e)
					}

					setTimeout(()=>{
						self.update(url, dataId, dataName,
									maxPageNum,repeatDelay, database,
									callback, pageNum+1, fullData)
					}, repeatDelay)
				})
				return
			}

			// 입력되어 있는 날씨 값을 콜백에 전달합니다.
			if(typeof callback === 'function')
				callback(data)

			for(let preCommand of self.preCommandQueue)
				if(typeof preCommand === 'function')
					preCommand(data)

			self.preCommandQueue = []
			self.isLoaded = true
			self.isLoading = false
		})
	}
}

export function Heatdata(app, database) {
	return new Industry(app, database, {

		// 대상코드 분류
		// A20 = 일반인
		// A21 = 노인
		// A22 = 어린이
		// A23 = 실외작업장
		// A24 = 농촌
		// A25 = 비닐하우스
		// A26 = 취약거주환경

		url: `https://www.weather.go.kr/weather/lifenindustry/li_asset/popup/heatdata_popup.jsp?CODE=A23`,
		dataJsonUrl: `http://www.weather.go.kr/weather/lifenindustry/heat_jisu_A23.jsp`,
		dataJsonName: `map_data_json`,
		dataId: `heatdata`,
		dataName: `온도지수`,
		maxPageNum: 21, // 0 ~ 21
		repeatDelay: 3000,
		updateHour: 7
	})
}

export function Enteritis(app, database) {
	return new Industry(app, database, {
		url: `https://www.weather.go.kr/weather/lifenindustry/li_asset/popup/imgdata_popup.jsp?CODE=A01`,
		dataJsonUrl: `http://www.weather.go.kr/weather/lifenindustry/jisudaymap_A01_2.jsp`,
		dataJsonName: `data_json`,
		dataId: `enteritis`,
		dataName: `식중독지수`,
		maxPageNum: 2, // 0 1 2
		repeatDelay: 3000,
		updateHour: 7
	})
}

export function UV(app, database) {
	return new Industry(app, database, {
		url: `https://www.weather.go.kr/weather/lifenindustry/li_asset/popup/imgdata_popup.jsp?CODE=A07_1`,
		dataJsonUrl: `http://www.weather.go.kr/weather/lifenindustry/jisudaymap_A07_1.jsp`,
		dataJsonName: `data_json`,
		dataId: `uv`,
		dataName: `자외선지수`,
		maxPageNum: 2, // 0 1 2
		repeatDelay: 3000,
		updateHour: 7
	})
}

export function Discomfort(app, database) {
	return new Industry(app, database, {
		url: `https://www.weather.go.kr/weather/lifenindustry/li_asset/popup/timedata_popup.jsp?CODE=A06`,
		dataJsonUrl: `http://www.weather.go.kr/weather/lifenindustry/jisutimemap_A06.jsp`,
		dataJsonName: `data_json`,
		dataId: `discomfort`,
		dataName: `불쾌지수`,
		maxPageNum: 18, // 0~18
		repeatDelay: 3000,
		updateHour: 16
	})
}

export function HeatIndex(app, database) {
	return new Industry(app, database, {
		url: `https://www.weather.go.kr/weather/lifenindustry/li_asset/popup/timedata_popup.jsp?CODE=A05`,
		dataJsonUrl: `http://www.weather.go.kr/weather/lifenindustry/jisutimemap_A05.jsp`,
		dataJsonName: `data_json`,
		dataId: `heatindex`,
		dataName: `열지수`,
		maxPageNum: 18, // 0~18
		repeatDelay: 3000,
		updateHour: 16
	})
}

export function Asthma(app, database) {
	return new Industry(app, database, {
		url: `https://www.weather.go.kr/weather/lifenindustry/li_asset/popup/imgdata_popup.jsp?CODE=D01`,
		dataJsonUrl: `http://www.weather.go.kr/weather/lifenindustry/jisudaymap_D01.jsp`,
		dataJsonName: `data_json`,
		dataId: `asthma`,
		dataName: `천식폐질환지수`,
		maxPageNum: 2, // 0 1 2
		repeatDelay: 3000,
		updateHour: 7
	})
}

export function Stroke(app, database) {
	return new Industry(app, database, {
		url: `https://www.weather.go.kr/weather/lifenindustry/li_asset/popup/imgdata_popup.jsp?CODE=D02`,
		dataJsonUrl: `http://www.weather.go.kr/weather/lifenindustry/jisudaymap_D02.jsp`,
		dataJsonName: `data_json`,
		dataId: `stroke`,
		dataName: `뇌졸중가능지수`,
		maxPageNum: 2, // 0 1 2
		repeatDelay: 3000,
		updateHour: 7
	})
}