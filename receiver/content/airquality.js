import request from 'request'
import Logger from '../../logger.js'
import iconv from 'iconv-lite'
import moment from 'moment'
import fs from 'fs'

import {findAddress} from './address.js'
import getPixels from 'get-pixels'

let utc = '+0900'
import path from 'path'

export function DustGrade(dotNum){
	dotNum = Number(dotNum)
	if(dotNum<4000) return '좋음'
	else if(dotNum<7000) return '보통'
	else if(dotNum>20000) return '나쁨'
	else return '주의'
}
export function SO2Grade(dotNum){
	dotNum = Number(dotNum)
	if(dotNum<3600) return '좋음'
	else if(dotNum<3900) return '보통'
	else if(dotNum>4200) return '나쁨'
	else return '주의'
}
export function NO2Grade(dotNum){
	dotNum = Number(dotNum)
	if(dotNum<3900) return '좋음'
	else if(dotNum<4200) return '보통'
	else if(dotNum>4500) return '나쁨'
	else return '주의'
}


// 인코딩 중 dustpic 이 전송 안 되는 현상 존재

export class AirQuality{
	constructor(app, database, option={}){
		this.isLoaded = false
		this.isLoading = false
		this.preCommandQueue = []
		this.pageUrls = []
		this.graph = []
		this.grade = {
			pm10: [],
			pm2_5: [],
			ozon: [],
			so2: [],
			no2: [],
		}

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
		if(!this.isLoaded){
			this.preCommandQueue.push(callback)
			return
		}

		database.metadata.get(`airquality.${this.option.dataId}`, (isSuccess, data)=>{
			callback(data)
		})
	}

	register(){
		let self = this
		let option = self.option

		if(self.intervalHandle !== null)
			clearInterval(self.intervalHandle)
		
		self.app.post(`/api/${option.dataId}`, (request, response)=>{
			self.get(self.database, (data)=>{
				response.send(data)
				response.end()
			})
		})

		this.intervalHandle = setInterval(()=>{
			if(self.isLoaded || self.isLoading) return
			self.isLoading = true
			self.update(option.dataId, option.dataName, option.repeatDelay, self.database)

		}, option.repeatDelay)
	}

	update(dataId, dataName, repeatDelay, database,
			callback, pageNum = null, fullData = []){

		let self = this
		database.metadata.get(`airquality.${dataId}`, (isSuccess, data)=>{

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

				// 최초 pageNum 이 pageNum일 때만
				// 해당 일자 최신 이미지 목록 획득
				if(pageNum === null){
					let imgUrls = [
						`http://www.webairwatch.com/kaq/modelimg_CASE4/PM10_24H_AVG.09KM.Day`, // 0~4 미세먼지
						`http://www.webairwatch.com/kaq/modelimg_CASE4/PM2_5_24H_AVG.09KM.Day`, // 5~9 초미세먼지
						`http://www.webairwatch.com/kaq/modelimg_CASE4/O3_1H_MAX.09KM.Day`, // 10~14 오존
						`http://www.webairwatch.com/kaq/modelimg_CASE4/SO2_24H_AVG.09KM.Day`, // 15~19 아황산
						`http://www.webairwatch.com/kaq/modelimg_CASE4/NO2_24H_AVG.09KM.Day` // 20~24 이산화질소
					]

					for(let imgUrl of imgUrls){
						for(let dayNum = 1; dayNum<=5 ;dayNum++)
							self.pageUrls.push(`${imgUrl}${dayNum}.gif`)
					}
					Logger.log(`안양대 기후융합연구소에서 ${dataName}를 받아오기 시작합니다.`)

					self.update(dataId, dataName, repeatDelay,
								database, callback, 0, fullData)
					return
				}

				let processUrl = self.pageUrls[pageNum]
				//Logger.log(`processUrl: ${processUrl}`)
				let stream = request.get(processUrl).pipe(fs.createWriteStream(path.join(process.cwd(), `/build/resources/gif/${dataId}_${pageNum}.gif`)))
				stream.on('finish', ()=>{
					Logger.log(`안양대 기후융합연구소에서 ${dataName}를 받아왔습니다. (${pageNum+1}/${self.pageUrls.length})`)

					if(self.pageUrls.length == (pageNum+1)){
						Logger.log(`안양대 기후융합연구소에서 받아온 ${dataName} 상 이미지 내 분포 값 해석중...`)

						for(let imgIndex in self.pageUrls){
							imgIndex = Number(imgIndex)

							let imgBuffer = fs.readFileSync(path.join(process.cwd(), `/build/resources/gif/${dataId}_${imgIndex}.gif`))
							getPixels(imgBuffer, 'image/gif', (error, pixels) => {
								Logger.log(`안양대 기후융합연구소에서 받아온 ${dataName} 상 이미지 내 분포 값 해석중... (${imgIndex+1}/${self.pageUrls.length})`)
								if (error) throw error
								let warnDotCount = 0
								let mapLoop = 0

								let xSize = pixels.shape[1]
								let ySize = pixels.shape[2]
								for (let y = 0; y < ySize; ++y) {
									for (let x = 0; x < xSize; ++x) {
										let colorData = [pixels.get(0, x, y, 0), pixels.get(0, x, y, 1), pixels.get(0, x, y, 2), pixels.get(0, x, y, 3)]

										// R이 180보다 크면서
										// G가 255보다 작은 색상군을
										// 주의레벨 평가수치 기준으로 판단
										if(colorData[0] >= 180 && colorData[1] < 255)
											warnDotCount++
									}
								}
								
								// 여기서 등급 자료 추가
								switch(Math.ceil((imgIndex+1)/5)){
									case 1:
										self.grade['pm10'].push(DustGrade(warnDotCount))
										break
									case 2:
										self.grade['pm2_5'].push(DustGrade(warnDotCount))
										break
									case 3:
										self.grade['ozon'].push(DustGrade(warnDotCount))
										break
									case 4:
										self.grade['so2'].push(SO2Grade(warnDotCount))
										break
									case 5:
										self.grade['no2'].push(NO2Grade(warnDotCount))
										break
								}
								self.graph.push(warnDotCount)
								if(self.pageUrls.length == (imgIndex+1)){
									Logger.log(`안양대 기후융합연구소에서 ${dataName}를 성공적으로 받아왔습니다.`)
									let dataSchema = {
										timestamp: (new Date()).getTime(),
										graph: self.graph,
										grade: self.grade
									}
									database.metadata.set(`airquality.${dataId}`, dataSchema)
								}
							})
						}
						return
					}

					setTimeout(()=>{
						self.update(dataId, dataName, repeatDelay, database,
									callback, pageNum+1, fullData)
					}, repeatDelay)
				})
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

let listPath = `http://kaq.or.kr/result/result_01.asp`
//let listPath = `https://www.naver.com`

export function File(app, database) {
	return new AirQuality(app, database, {
		listPath,
		dataName: `5일치 한국대기질 예보 지도`,
		dataId: `dustpic`,
		updateHour: 6,
		repeatDelay: 1000
	})
}