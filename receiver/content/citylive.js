import request from 'request'
import Logger from '../../logger.js'
import iconv from 'iconv-lite'
import moment from 'moment'
import fs from 'fs'

import {getAddressData} from './address.js'

import {PNG} from 'node-png'
import GIFEncoder from 'gifencoder'
import pngFileStream from 'png-file-stream'

let utc = '+0900'
import path from 'path'

let codeData = {
	'서울' : [37.563370, 126.993000],
	'백령도' : [37.959052, 124.665704],
	'인천': [37.456260, 126.705200],
	'수원': [37.258590, 127.016000],
	'동두천': [37.931050, 127.061900],
	'파주': [37.834730, 126.810800],
	'강화': [37.746730, 126.487900],
	'양평': [37.48782, 127.515053],
	'이천': [37.283298, 127.449997],
	'북춘천': [37.858791, 127.73571],
	'북강릉': [37.818171, 128.858883],
	'울릉도': [37.498120, 130.869700],
	'속초': [38.235291, 128.558411],
	'철원': [38.25, 127.216698],
	'대관령': [37.679478, 128.741226],
	'춘천': [37.858791, 127.73571],
	'강릉': [37.755260, 128.896400],
	'동해': [37.822800, 128.155500],
	'원주': [37.344742, 127.948631],
	'영월': [37.183640, 128.461700],
	'인제': [38.071861, 128.169571],
	'홍천': [37.692226, 127.886292],
	'태백': [37.166698, 128.983307],
	'정선군': [37.380760, 128.660900],
	'서산': [36.779346, 126.451828],
	'청주': [36.637950, 127.492800],
	'대전': [36.334490, 127.437300],
	'충주': [36.972390, 127.934500],
	'추풍령': [36.206670, 128.005000],
	'홍성': [36.590061, 126.670738],
	'제천': [37.14962, 128.213577],
	'보은': [36.489460, 127.729500],
	'천안': [36.807610, 127.158800],
	'보령': [36.333923, 126.621628],
	'부여': [36.27684, 126.914177],
	'금산': [36.085991, 127.489807],
	'전주': [35.827000, 127.144400],
	'광주': [35.152939, 126.905151],
	'목포': [34.796856, 126.394417],
	'여수': [34.734928, 127.743767],
	'흑산도': [34.670700, 125.420000],
	'군산': [35.979310, 126.718400],
	'완도': [34.305828, 126.746857],
	'고창': [35.428799, 126.694336],
	'순천': [34.944832, 127.493721],
	'진도(첨찰산)': [34.480942, 126.267235],
	'부안': [35.720703, 126.729286],
	'임실': [35.619460, 127.348200],
	'정읍': [35.570390, 126.846900],
	'남원': [35.378770, 127.376300],
	'장수': [35.652824, 127.527527],
	'고창군': [35.428799, 126.694336],
	'영광군': [35.277170, 126.512000],
	'순창군': [35.373610, 127.142800],
	'보성군': [34.770560, 127.081700],
	'강진군': [34.640560, 126.770000],
	'장흥': [34.676201, 126.911194],
	'해남': [34.555592, 126.591972],
	'고흥': [34.607918, 127.288696],
	'진도군': [34.480942, 126.267235],
	'제주': [33.512161, 126.525734],
	'고산': [35.978947, 127.211456],
	'성산': [37.759151, 127.97686],
	'서귀포': [33.252820, 126.561100],
	'안동': [36.567000, 128.717000],
	'포항': [36.037868, 129.366272],
	'대구': [35.854019, 128.610336],
	'울산': [35.538269, 129.313324],
	'창원': [35.254420, 128.626700],
	'부산': [35.177930, 129.078500],
	'울진': [36.986523, 129.396591],
	'상주': [36.410800, 128.159000],
	'통영': [34.854420, 128.433200],
	'진주': [35.176682, 128.085495],
	'김해시': [35.227100, 128.881900],
	'북창원': [35.254420, 128.626700],
	'양산시': [35.338010, 129.041900],
	'의령군': [35.373080, 128.271200],
	'함양군': [35.520460, 127.725200],
	'봉화': [36.883301, 128.75],
	'영주': [36.826460, 128.620000],
	'문경': [36.586150, 128.186800],
	'청송군': [36.435910, 129.057100],
	'영덕': [36.410381, 129.36644],
	'의성': [36.350708, 128.694717],
	'구미': [36.127071, 128.351654],
	'영천': [35.946020, 128.919200],
	'경주시': [35.839550, 129.216200],
	'거창': [35.686720, 127.909500],
	'합천': [35.566500, 128.166000],
	'밀양': [35.482260, 128.764900],
	'산청': [35.415590, 127.873500],
	'거제': [34.854420, 128.433200],
	'남해': [34.824726, 127.904724]
}

export function findCloserStationName(paramLat, paramLong){
	let lat = Number(paramLat)
	let long = Number(paramLong)

	let foundData = null

	for(let stationName in codeData){
		let rootAddress = codeData[stationName]

		let coordDiff = 0
		coordDiff += Math.abs(lat - rootAddress[0])
		coordDiff += Math.abs(long - rootAddress[1])

		if(foundData === null || foundData.diff > coordDiff){
			foundData = {
				name: stationName,
				x: rootAddress[0],
				y: rootAddress[1],
				diff: coordDiff
			}
		}
	}
	return foundData.name
}

export class CityLive{
	constructor(app, database, option={}){
		this.isLoaded = false
		this.isLoading = false
		this.preCommandQueue = []
		this.pageUrls = []
		this.imageUrls = []

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

		database.metadata.get(`citylive.${this.option.dataId}`, (isSuccess, data)=>{
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
				let requestSchema = request.body
				if(requestSchema === undefined || requestSchema === null) {
					Logger.log(`잘못된 유형의 ${option.dataName} 요청발생`)
					response.send(null)
					response.end()
					return
				}

				if(typeof requestSchema['x'] !== 'undefined'
				  && typeof requestSchema['y'] !== 'undefined'){

					let x = Number(requestSchema['x'])
					let y = Number(requestSchema['y'])

					let stationName = findCloserStationName(x, y)
					response.send(data.data[stationName])
					response.end()
					return
				}

				response.send(null)
				response.end()
			})
		})

		let updateWork = ()=>{
			if(self.isLoading) return
			self.isLoading = true
			self.update(option.dataId, option.dataName, option.repeatDelay, self.database)

		}
		this.intervalHandle = setInterval(updateWork, option.repeatDelay)
		updateWork()
	}

	update(dataId, dataName, repeatDelay, database,
			callback, pageNum = null, fullData = []){

		let self = this
		database.metadata.get(`citylive.${dataId}`, (isSuccess, data)=>{

			// 데이터 유효기간 만료여부 검사
			let isNeedToUpdate = false
			if(data !== null && data !== undefined
				&& typeof data === 'object'
				&& typeof data['timestamp'] !== 'undefined' && !isNaN(data['timestamp'])){

				let downloadTime = moment(Number(data['timestamp'])).utcOffset(utc)

				// 1시간이 안 지났으면
				let updateTime = moment(downloadTime).add(60, 'minutes')
				if(updateTime <= moment().utcOffset(utc)) isNeedToUpdate = true
			}

			// 기존 정상 데이터가 없는 경우 또는
			// 유효기간이 만료된 경우 최신화
			if(!isSuccess || data === null
			   || data === undefined || isNeedToUpdate){

				// encoding must be null
				request({
					uri: self.option.listPath,
					encoding: null}, (err, response, body)=>{

					try{
						body = iconv.decode(body, 'EUC-KR').toString()
						if(body == null || body == undefined || typeof body != 'string') throw new Error()
					}catch(e){
						Logger.log(`기상청에서 받은 ${dataName}의 인코딩해석에 실패했습니다.`, `[Backend:CITYLive]`)
						console.log(body)
						return
					}

					try{
						let data = {}
						let dataSheets = body.split(`<table`)[1].split(`</table>`)[0].split(`<tr>`)
						dataSheets.shift()

						let parsedDataSheets = {}
						for(let dataSheet of dataSheets){
							if(typeof dataSheet.split(`/weather/observation/currentweather.jsp?`)[1] == 'undefined')
								continue

							dataSheet = dataSheet.split(`</tr>`)[0]

							let stationName = dataSheet.split(`/weather/observation/currentweather.jsp?`)[1].split(`</a>`)[0].split(`" >`)[1]
							let options = []
							for(let option of dataSheet.split(`<td>`)){
								option = option.split(`</td>`)[0]
								if(option == `&nbsp;`) option = null
								options.push(option)
							}

							options.shift()
							options.shift()

							let parsedDataSheet = {
								stationName,
								weather: options[0],
								viewDistance: options[1],
								cloudness: options[2], // 운량
								actualCloudness: options[3], // 중하운량
								temp: options[4],
								dewPoint: options[5], // 이슬점 온도계
								discomfortIndex: options[6],
								dayOfRainAmount: options[7],
								humidity: options[8],
								windDirection: options[9],
								windSpeed: options[10],
								hpa: options[11]
							}
							if(options[11] === null || options[11] === undefined)
								throw new Error('저장방지')
							parsedDataSheets[stationName] = parsedDataSheet
						}

						Logger.log(`기상청에서 ${dataName}를 받아왔습니다. 좌표확인된정보:${dataSheets.length}개`, `[Backend:CITYLive]`)

						let dataSchema = {
							timestamp: (new Date()).getTime(),
							data: parsedDataSheets
						}
						database.metadata.set(`citylive.${dataId}`, dataSchema)
					}catch(e){
						Logger.log(`기상청에서 받아온 ${dataName}를 해석하는데 실패했습니다.`, `[Backend:CITYLive]`)
						//console.log(e)
					}
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

let listPath = `http://www.weather.go.kr/weather/observation/currentweather.jsp`

export function File(app, database) {
	return new CityLive(app, database, {
		listPath,
		dataName: `전국 도시관측소 시정정보`,
		dataId: `citylive`,
		repeatDelay: 10000
	})
}