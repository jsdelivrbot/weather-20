import request from 'request'
import Logger from '../../logger.js'
import iconv from 'iconv-lite'
import moment from 'moment'
import fs from 'fs'

import {getAddressData} from './address.js'

import {PNG} from 'node-png'
import GIFEncoder from 'gifencoder'
import pngFileStream from 'png-file-stream'

import {RequestLiveWeatherData} from './weather.js'
import {findAddress} from './address.js'

let utc = '+0900'
import path from 'path'

let koreaMapAddress = {
	인천: [37.45323333333334, 126.70735277777779],
	서울: [37.56356944444444, 126.98000833333333],
	춘천: [37.858791, 127.73571],
	수원: [37.263435, 127.02858],
	원주: [37.344742, 127.948631],
	강릉: [37.751885, 128.876066],
	세종: [36.4800121, 127.2890691],
	대전: [36.347119444444445, 127.38656666666667],
	충주: [36.972390, 127.934500],
	울릉: [37.502335, 130.860840],
	독도: [37.502335, 130.860840],
	목포: [34.796856, 126.394417],
	전주: [35.824213, 127.147998],
	대구: [35.868541666666665, 128.60355277777776],
	제주: [33.512161, 126.525734],
	광주: [35.156974999999996, 126.85336388888888],
	여수: [34.734928, 127.743767],
	부산: [35.17701944444444, 129.07695277777776],
	울산: [35.538270, 129.313300],
	포천: [37.894740, 127.200200],
}

let directStationCodeData = {
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
	'남해': [34.824726, 127.904724],
	'독도': [37.502335, 130.860840],
}

let areaData = {
	인천: undefined,
	서울: undefined,
	춘천: undefined,
	수원: undefined,
	원주: undefined,
	강릉: undefined,
	세종: undefined,
	대전: undefined,
	충주: undefined,
	울릉: undefined,
	독도: undefined,
	목포: undefined,
	전주: undefined,
	대구: undefined,
	제주: undefined,
	광주: undefined,
	여수: undefined,
	부산: undefined,
	울산: undefined,
	포천: undefined // 기믹
}
export function updateAreaData(paramLat, paramLong, paramData, paramStationName){
	let station = findMapAddress(paramLat, paramLong)
	
	// 찾는 지역명과 관측소명이 100% 일치할 경우
	// 해당 지점의 데이터를 그냥 이용
	if(typeof koreaMapAddress[paramStationName] != 'undefined'){
		//console.log(paramStationName, '보정')
		areaData[paramStationName] = {
			station: {
				name: paramStationName,
				x: koreaMapAddress[paramStationName][0],
				y: koreaMapAddress[paramStationName][1],
				diff: 0
			},
			data: paramData
		}
		return
	}

	if(typeof areaData[station.name] == 'undefined'){
		areaData[station.name] = {
			station,
			data: paramData
		}
		return
	}
	
	if(areaData[station.name].station.diff > station.diff){
		areaData[station.name] = {
			station,
			data: paramData
		}
	}
}

export function findMapAddress(paramLat, paramLong){
	let lat = Number(paramLat)
	let long = Number(paramLong)


	// 해당좌표에서 가장 가까운 지역명을 찾습니다.
	let foundData = null
	for(let stationName in koreaMapAddress){
		let rootAddress = koreaMapAddress[stationName]

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
	return foundData
}

function setByPath(obj, path, value) {
	let parts = path.split('.')
	return parts.reduce((prev, curr, ix)=>{
		return (ix + 1 == parts.length)
		? prev[curr] = value
		: prev[curr] = prev[curr] || {}
	}, obj)
}

function getByPath(obj, value) {
	let innerValue = value.replace(/\[(\w+)\]/g, '.$1')
	innerValue = innerValue.replace(/^\./, '')
	let a = innerValue.split('.')
	for (let i = 0, n = a.length; i < n; ++i) {
		let k = a[i]
		if (k in obj) 
			obj = obj[k]
		else
			return
	}
	return obj
}

export class AWSLive{
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

		database.metadata.get(`awslive.${this.option.dataId}`, (isSuccess, data)=>{
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

				if(typeof requestSchema['address'] !== 'undefined'){
					try{
						let localData = getByPath(data.data, requestSchema['address'])
						if(typeof localData['stationCode'] === 'undefined') throw new Error()
						
						response.send(localData)
						response.end()
					}catch(e){
						response.send(null)
						response.end()
					}
					return
				}

				if(typeof requestSchema['x'] !== 'undefined'
				  && typeof requestSchema['y'] !== 'undefined'){

					let x = Number(requestSchema['x'])
					let y = Number(requestSchema['y'])
					let addressData = this.findAddress(data.data, x, y)
					let localData = addressData.data
					localData.global = data.global
					if(typeof localData['stationCode'] === 'undefined') throw new Error()

					// 이거만 60분 간격으로 돌게 됩니다.
					// 직접 요청할 경우 1분단위로 19개 지점의 데이터를 얻어대서
					// 바로 api request 한도량 초과될 수 있음
					let needToReceiveDataCount = Object.keys(localData.global).length
					for(let areaInnerKey of Object.keys(localData.global)){
						let globalAreaData = localData.global[areaInnerKey]
						let globalAreaAddress = findAddress(globalAreaData.station.x, globalAreaData.station.y)
						RequestLiveWeatherData(self.database, globalAreaAddress.cell, (liveDataSchema)=>{
							//console.log(`${needToReceiveDataCount-1} 번째 데이터 병합중: ${areaInnerKey}(${globalAreaAddress.cell})`)
							localData.global[areaInnerKey]['live'] = liveDataSchema

							// 모든데이터를 다 받은 경우
							if(--needToReceiveDataCount <= 0){
								response.send(localData)
								response.end()
							}
						})
					}
					//response.send(localData)
					//response.end()
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

	findAddress(codeData, paramLat, paramLong){
		let lat = Number(paramLat)
		let long = Number(paramLong)

		let foundedCoord = null
		for(let firstLevel of Object.keys(codeData)){
			for(let secondLevel of Object.keys(codeData[firstLevel])){
				for(let thirdLevel of Object.keys(codeData[firstLevel][secondLevel])){
					let innerLevelData = codeData[firstLevel][secondLevel][thirdLevel]
					if(innerLevelData === null || innerLevelData === undefined) continue
					if(typeof innerLevelData['stationCode'] == 'undefined'
					   || typeof innerLevelData['coordinate'] == 'undefined') continue
					if(innerLevelData.coordinate === undefined) continue;

					let coordDiff = 0
					coordDiff += Math.abs(lat - Number(innerLevelData.coordinate[2]))
					coordDiff += Math.abs(long - Number(innerLevelData.coordinate[1]))

					// 아직 찾은 좌표가 하나도 없거나
					// 비교대상보다 좌표비교값이 더 작으면
					if(foundedCoord === null || foundedCoord.diff > coordDiff){
						foundedCoord = {
							diff: coordDiff,
							data: innerLevelData,
							key: `${firstLevel}.${secondLevel}.${thirdLevel}`
						}
					}
				}
			}
		}
		if(typeof foundedCoord['diff'] !== 'undefined')
			delete foundedCoord['diff']
		return foundedCoord
	}

	findStation(codeData, paramStationName){
		for(let firstLevel of Object.keys(codeData)){
			for(let secondLevel of Object.keys(codeData[firstLevel])){
				for(let thirdLevel of Object.keys(codeData[firstLevel][secondLevel])){

					let innerLevelData = codeData[firstLevel][secondLevel][thirdLevel]
					if(innerLevelData === null || innerLevelData === undefined) continue
					if(typeof innerLevelData['stationCode'] == 'undefined'
					   || typeof innerLevelData['coordinate'] == 'undefined') continue
					if(innerLevelData.coordinate === undefined) continue

					if(innerLevelData['stationName'] == paramStationName)
						return innerLevelData
				}
			}
			return null
		}
	}

	update(dataId, dataName, repeatDelay, database,
			callback, pageNum = null, fullData = []){

		let self = this
		database.metadata.get(`awslive.${dataId}`, (isSuccess, data)=>{

			// 데이터 유효기간 만료여부 검사
			// 2분단위
			let isNeedToUpdate = false
			if(data !== null && data !== undefined
				&& typeof data === 'object'
				&& typeof data['timestamp'] !== 'undefined' && !isNaN(data['timestamp'])){

				let downloadTime = moment(Number(data['timestamp'])).utcOffset(utc)

				// 1분이 안 지났으면
				let updateTime = moment(downloadTime).add(1, 'minutes')
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
						Logger.log(`기상청에서 받은 ${dataName}의 인코딩해석에 실패했습니다.`)
						console.log(body)
						return
					}
					//console.log(self.option.listPath)
					//console.log(body)

					let coordNonAddedCount = 0
					let coordAddedCount = 0
					try{
						let data = {}
						let dataSheets = body.split('#999999')[1].split('</table>')[0].split('<tr')
						let parsedDataSheets = []
						for(let dataSheet of dataSheets){
							dataSheet = dataSheet.split('</tr>')[0]
							if(dataSheet.indexOf(`javascript:parent.parent.menu.stn_select`) == -1)
								continue
								
							//console.log(`dataSheet: ${dataSheet}`)

							// 해석시작
							let nonParsedSubOptions = dataSheet.split(`<td`)//class=textb>
							
							let subOptions = []
							for(let subOptionsIndex in nonParsedSubOptions){
								let subOption = nonParsedSubOptions[subOptionsIndex]
								if(subOption.indexOf(`class=textb>`) == -1){
									subOption = subOption.split('>')[1].split(`</td`)[0]
								}else{
									subOption = subOption.split(`class=textb>`).join(``).split(`</td`)[0]
								}
								subOptions.push(subOption)
							}

							for(let i=1;i<=5;i++)
								subOptions.shift()

							let parsedDataSheet = {
								stationCode: dataSheet.split(`javascript:parent.parent.menu.stn_select(`)[1].split(`);`)[0],
								stationName: dataSheet.split(`);'>`)[2].split(`</a>`)[0],
								address: subOptions[15],
								rainCheck: dataSheet.indexOf(`●`) !== -1,
								rain15: subOptions[0],
								rain60: subOptions[1],
								rain3h: subOptions[2],
								rain6h: subOptions[3],
								rain12h: subOptions[4],
								rainDay: subOptions[5],
								temp: subOptions[6],
								wind1Degree: subOptions[7],
								wind1Direction: subOptions[8],
								wind1Speed: subOptions[9],
								wind2Degree: subOptions[10],
								wind2Direction: subOptions[11],
								wind2Speed: subOptions[12],
								humidity: subOptions[13],
								seaLevelPressure: subOptions[14],
							}

							if(typeof parsedDataSheet.address['split'] == 'undefined')
								throw Error(parsedDataSheet)
							let address = parsedDataSheet.address.split(' ')

							//address 가 3개이상 내려가면 3개까지만 고정
							if(address.length > 3)
								address = [address[0], address[1], address[2]]

							// 어드레스 정보로 좌표 얻기
							let coordinate = getAddressData(address.join('.'))
							
							// 가지고있는 관측소좌표 대조
							if(coordinate === undefined){
								//directStationCodeData
								if(typeof directStationCodeData[parsedDataSheet.stationName] !== 'undefined'){
									let tempCoord = directStationCodeData[parsedDataSheet.stationName]
									coordinate = [null, tempCoord[1], tempCoord[0]]
								}
							}
							if(coordinate === undefined){
								coordNonAddedCount++
							}else{
								coordAddedCount++
							}
							parsedDataSheet.coordinate = coordinate

							let addressKey = ''
							for(let addressIndex in address){
								if(addressIndex+1 == address.length) break
								if(addressIndex != 0) addressKey += '.'
								addressKey += address[addressIndex]

								if(getByPath(data, addressKey) == undefined)
									setByPath(data, addressKey, {})
							}
							setByPath(data, address.join('.'), parsedDataSheet)
							parsedDataSheets.push(parsedDataSheet)
						}

						Logger.log(`기상청에서 ${dataName}를 받아왔습니다. 좌표확인된정보:${coordAddedCount}개 (좌표미확인정보:${coordNonAddedCount}개)`)

						for(let parsedDataSheet of parsedDataSheets){
							// 좌표 있는 자료만
							if(typeof parsedDataSheet['coordinate'] == 'undefined') continue;

							// parsedDataSheet['coordinate']
							// "1111056000"
							// "126.96887777777778"
							// "37.60252222222223"
							let parsedDataX = parsedDataSheet['coordinate'][2]
							let parsedDataY = parsedDataSheet['coordinate'][1]
							updateAreaData(parsedDataX, parsedDataY, parsedDataSheet, parsedDataSheet.stationName)
						}

						//TODO 여기에서 가까운 지역의 weather(맑음 흐림 그런) 자료 찾아서 추가해야함
						//console.log(areaData)
						let dataSchema = {
							timestamp: (new Date()).getTime(),
							data,
							global: areaData,
						}
						database.metadata.set(`awslive.${dataId}`, dataSchema)
					}catch(e){
						Logger.log(`기상청에서 받아온 ${dataName}를 해석하는데 실패했습니다.`)
						console.log(e)
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

let listPath = `http://www.weather.go.kr/cgi-bin/aws/nph-aws_txt_min`

export function File(app, database) {
	return new AWSLive(app, database, {
		listPath,
		dataName: `전국관측소 분단위 갱신정보`,
		dataId: `awslive`,
		repeatDelay: 5000
	})
}