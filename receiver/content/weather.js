import request from 'request'
import moment from 'moment'
import {parseString} from 'xml2js'
import {findRootAddress, findRootDetailAddress} from './address.js'
import Logger from '../../logger.js'
import iconv from 'iconv-lite'

let utc = `+09:00`
let serviceKey = `ZyS8WG8B9gda%2Bb3A4S2rjydFD2SOjrXYAjJpzVoO2Kx4WEiAngX6sFixyUW9g1KbIskw%2FiwW5K%2FJ%2Bzbl7XRQjg%3D%3D`

function textClear(str){
	let cleared = str.split(`\n`).join('').split(`\t`).join('').split('  ').join('')
	if(cleared[0] == ' ') cleared.slice(1)
	if(cleared[cleared.length-1] == ' ') cleared = cleared.slice(0, -1)
	return cleared
}

export function RequestMonthlyWeatherData(database, callback){
	database.metadata.get(`weather.global`, (isSuccess, data)=>{

		// 기존 데이터가 없는 경우 또는
		// 데이터 다운로드 시점으로부터 1시간이 지난 경우
		if(!isSuccess || data === null ||
		  (typeof data === 'object'
		   && typeof data['timestamp'] !== 'undefined'
		   && moment(Number(data['timestamp'])).add(1, 'hours') <= moment()) ){

			try{
				// 최신 기상데이터 파일의 이름을 얻어옵니다.
				request({
						uri: `https://www.weather.go.kr/weather/lifenindustry/sevice_rss.jsp`,
						rejectUnauthorized: false,
						encoding: null

					}, (error, response, body) => {

					if(body === undefined){
						console.log('신규 포멧 형태 받음')
						return
					}

					body = String(body)

					let monthlyWeatherDataName = body.split(`http://www.kma.go.kr/repositary/xml/fct/mon/img/fct_mon1rss_`)[1].split(`.xml`)[0]
					request({
							uri: `https://www.kma.go.kr/repositary/xml/fct/mon/img/fct_mon1rss_${monthlyWeatherDataName}.xml`,
							encoding: null
					}, (error, response, body) => {

						// 데이터 인코딩 파싱
						body = iconv.decode(body, 'EUC-KR').toString()

						parseString(body, (err, result) => {
							Logger.log(`기상청에서 한달치 전국 기상예보 데이터를 받아왔습니다.`)

							// 순서를 재구성합니다.
							let monthlyForeCast = {
								title: textClear(result.rss.channel[0].item[0].title[0]), // "1개월전망 전국 - 2018년 6월 14일 11시  발표"
								category: result.rss.channel[0].item[0].category[0], // "육상 장기예보 1개월 전망"

								targetDate: result.rss.channel[0].item[0].description[0].header[0].date[0], // "2018년 6월 25일 ~ 7월 22일"
								currentDate: result.rss.channel[0].item[0].description[0].header[0].ydate[0], // "2018년 6월 14일 11시"
								nextDate: result.rss.channel[0].item[0].description[0].header[0].next_ydate[0], // "2018년 6월 21일 11시"

								summary: textClear(result.rss.channel[0].item[0].description[0].body[0].summary[0]), 
								// <![CDATA[ ○ 기온 전망 : 대체로 평년과 비슷하거나 높겠습니다.○ 강수량 전망 : 대체로 평년과 비슷하겠습니다. ]]>

								review: [], // 전국의 4주치 리뷰
								temp: {}, // 각 지역별 4주치 기온전망
								rain: {}, // 각 지역별 4주치 강수전망
							}

							// 전국의 4주치 리뷰 해석
							for(let weekIndex in result.rss.channel[0].item[0].description[0].body[0].weather_forecast[0].week){
								let week = result.rss.channel[0].item[0].description[0].body[0].weather_forecast[0].week[weekIndex]
								monthlyForeCast.review.push({
									period: week[`week${Number(weekIndex)+1}_period`][0],
									review: textClear(week[`week${Number(weekIndex)+1}_weather_review`][0])
								})
							}

							// ta 지역별 4주 기온 전망태그
							// 각 지역별 4주치 기온전망데이터 해석
							for(let localData of result.rss.channel[0].item[0].description[0].body[0].onemonth_ta_forecast[0].local_ta){

								let localPreName = localData.local_ta_name[0]
								let localName = [] //해석된 실제 지역명

								if(localPreName.indexOf('전국') != -1){
									localName.push('전국')
								}else if(localPreName.indexOf('서울ㆍ인천ㆍ경기도') != -1){
									localName.push('서울')
									localName.push('인천')
									localName.push('경기남부')
									localName.push('경기북부')
								}else if(localPreName.indexOf('대전ㆍ세종ㆍ충청남도') != -1){
									localName.push('대전')
									localName.push('세종')
									localName.push('충남')
								}else if(localPreName.indexOf('충청북도 ') != -1){
									localName.push('충북')
								}else if(localPreName.indexOf('광주ㆍ전라남도') != -1){
									localName.push('광주')
									localName.push('전남')
								}else if(localPreName.indexOf('전라북도') != -1){
									localName.push('전북')
								}else if(localPreName.indexOf('부산ㆍ울산ㆍ경상남도') != -1){
									localName.push('부산')
									localName.push('울산')
									localName.push('경남')
								}else if(localPreName.indexOf('대구ㆍ경상북도') != -1){
									localName.push('대구')
									localName.push('경북')
								}else if(localPreName.indexOf('제주도') != -1){
									localName.push('제주')
								}
								
								for(let localNameWork of localName){
									monthlyForeCast.temp[localNameWork] = []

									for(let localWeekDataIndex in localData.week_local_ta){
										let localWeekData = localData.week_local_ta[localWeekDataIndex]
										monthlyForeCast.temp[localNameWork].push({
											normalYear: localWeekData[`week${Number(localWeekDataIndex)+1}_local_ta_normalYear`][0],
											similarRange: localWeekData[`week${Number(localWeekDataIndex)+1}_local_ta_similarRange`][0],
											minVal: localWeekData[`week${Number(localWeekDataIndex)+1}_local_ta_minVal`][0],
											similarVal: localWeekData[`week${Number(localWeekDataIndex)+1}_local_ta_similarVal`][0],
											maxVal: localWeekData[`week${Number(localWeekDataIndex)+1}_local_ta_maxVal`][0]
										})
									}
								}
							}

							// rn 지역별 4주 강수 전망태그
							// 각 지역별 4주치 강수전망데이터 해석
							for(let localData of result.rss.channel[0].item[0].description[0].body[0].onemonth_rn_forecast[0].local_rn){

								let localPreName = localData.local_rn_name[0]
								let localName = [] //해석된 실제 지역명

								if(localPreName.indexOf('전국') != -1){
									localName.push('전국')
								}else if(localPreName.indexOf('서울ㆍ인천ㆍ경기도') != -1){
									localName.push('서울')
									localName.push('인천')
									localName.push('경기남부')
									localName.push('경기북부')
								}else if(localPreName.indexOf('대전ㆍ세종ㆍ충청남도') != -1){
									localName.push('대전')
									localName.push('세종')
									localName.push('충남')
								}else if(localPreName.indexOf('충청북도 ') != -1){
									localName.push('충북')
								}else if(localPreName.indexOf('광주ㆍ전라남도') != -1){
									localName.push('광주')
									localName.push('전남')
								}else if(localPreName.indexOf('전라북도') != -1){
									localName.push('전북')
								}else if(localPreName.indexOf('부산ㆍ울산ㆍ경상남도') != -1){
									localName.push('부산')
									localName.push('울산')
									localName.push('경남')
								}else if(localPreName.indexOf('대구ㆍ경상북도') != -1){
									localName.push('대구')
									localName.push('경북')
								}else if(localPreName.indexOf('제주도') != -1){
									localName.push('제주')
								}

								for(let localNameWork of localName){
									monthlyForeCast.rain[localNameWork] = []

									for(let localWeekDataIndex in localData.week_local_rn){
										let localWeekData = localData.week_local_rn[localWeekDataIndex]
										monthlyForeCast.rain[localNameWork].push({
											normalYear: localWeekData[`week${Number(localWeekDataIndex)+1}_local_rn_normalYear`][0],
											similarRange: localWeekData[`week${Number(localWeekDataIndex)+1}_local_rn_similarRange`][0],
											minVal: localWeekData[`week${Number(localWeekDataIndex)+1}_local_rn_minVal`][0],
											similarVal: localWeekData[`week${Number(localWeekDataIndex)+1}_local_rn_similarVal`][0],
											maxVal: localWeekData[`week${Number(localWeekDataIndex)+1}_local_rn_maxVal`][0]
										})
									}
								}
							}

							let monthlyDataSchema = {
								timestamp: (new Date()).getTime(),
								forecast: monthlyForeCast
							}
							database.metadata.set(`weather.global`, monthlyDataSchema)
						})
					})
				})
			}catch(e){}
		}

		// 입력되어 있는 날씨 값을 콜백에 전달합니다.
		if(typeof callback === 'function')
			callback(data)
	})
}

export function RequestWeeklyWeatherData(database, callback){
	database.metadata.get(`weather.weekly`, (isSuccess, data)=>{

		// 기존 데이터가 없는 경우 또는
		// 데이터 다운로드 시점으로부터 1시간이 지난 경우
		if(!isSuccess || data === null ||
		  (typeof data === 'object'
		   && typeof data['timestamp'] !== 'undefined'
		   && moment(Number(data['timestamp'])).add(1, 'hours') <= moment()) ){

			try{
				// 최신 기상데이터 파일의 이름을 얻어옵니다.
				request({
						uri: `https://www.weather.go.kr/weather/lifenindustry/sevice_rss.jsp`,
						rejectUnauthorized: false,
						encoding: null

					}, (error, response, body) => {

					if(body === undefined){
						console.log('신규 포멧 형태 받음')
						return
					}

					body = String(body)

					let weeklyWeatherDataName = body.split(`http://www.kma.go.kr/weather/forecast/mid-term-rss3.jsp?`)[1].split(`" id="dfs_rss1"`)[0]
					request({
							uri: `http://www.kma.go.kr/weather/forecast/mid-term-rss3.jsp?${weeklyWeatherDataName}`,
							encoding: null
					}, (error, response, body) => {

						// 데이터 인코딩 파싱
						//body = iconv.decode(body, 'EUC-KR').toString()

						parseString(body, (err, result) => {
							Logger.log(`기상청에서 주간 전국 기상예보 데이터를 받아왔습니다.`)

							// 순서를 재구성합니다.
							let weeklyForeCast = {
								title: textClear(result.rss.channel[0].item[0].title[0]), // "전국 육상 중기예보 - 2018년 06월 21일 (목)요일 06:00 발표"
								category: result.rss.channel[0].item[0].category[0], // "육상중기예보"

								broadcast: result.rss.channel[0].item[0].description[0].header[0].tm[0], // "201806210600"
								description: result.rss.channel[0].item[0].description[0].header[0].wf[0], // "장마전선의 영향으로 25일 제주도에서 비가 시작되어.."

								location: {}, // 전국의 10일치 데이터
							}

							// 전국의 10일치 주간 데이터 수집
							for(let weekIndex in result.rss.channel[0].item[0].description[0].body[0].location){
								let week = result.rss.channel[0].item[0].description[0].body[0].location[weekIndex]
								let locationName = week.city[0]
								weeklyForeCast.location[locationName] = week.data
							}

							let weeklyDataSchema = {
								timestamp: (new Date()).getTime(),
								forecast: weeklyForeCast
							}
							database.metadata.set(`weather.weekly`, weeklyDataSchema)
						})
					})
				})
			}catch(e){}
		}

		// 입력되어 있는 날씨 값을 콜백에 전달합니다.
		if(typeof callback === 'function')
			callback(data)
	})
}

export function RequestLiveWeatherData(database, cellNumber, callback){
	database.metadata.get(`weather.live.${cellNumber}`, (isSuccess, data)=>{
		// 기존 데이터가 없는 경우 또는
		// 데이터 다운로드 시점으로부터 1시간이 지난 경우
		try{
			if(!isSuccess || data === null ||
			  (typeof data === 'object'
			   && typeof data['timestamp'] !== 'undefined'
			   && moment(Number(data['timestamp'])).add(1, 'hours') <= moment()) ){

				// 여기에 작업 시작
				// 셀번호 -> 격자X Y 획득
				RequestWeatherData(database, cellNumber, (dailyDataSchema)=>{

					let Nx = dailyDataSchema.forecast.x
					let Ny = dailyDataSchema.forecast.y

					let currentTime = moment().utcOffset(utc)
					if(currentTime.get('minute') < 50)
						currentTime.add(-1, 'hour')// 50분보다 적으면 1시간 빼기

					let baseDate = currentTime.format(`YYYYMMDD`)

					// MM이 50보다 작으면 -1시간 추가
					currentTime.get('minute')
					let baseTime = currentTime.format(`HH00`)

					request({
						uri: `http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastGrib?serviceKey=${serviceKey}&base_date=${baseDate}&base_time=${baseTime}&nx=${Nx}&ny=${Ny}&numOfRows=10&pageSize=10&pageNo=1&startPage=1&_type=json`,
						rejectUnauthorized: false

					}, (error, response, body) => {
						let liveData  = null
						try{ liveData = JSON.parse(body) }catch(e){}

						let parsedData = {}
						if(liveData === null || liveData === undefined){
							return
						}

						for(let itemIndex in liveData.response.body.items.item){
							let item = liveData.response.body.items.item[itemIndex]
							switch(item.category){
								case 'LGT':
									parsedData.lightning = item
									break
								case 'PTY':
									parsedData.weather = item
									break
								case 'REH':
									parsedData.humidity = item
									break
								case 'RN1':
									parsedData.rainAmountAfter1Hour = item
									break
								case 'SKY':
									parsedData.cloud = item
									break
								case 'T1H':
									parsedData.temp = item
									break
								case 'UUU':
									parsedData.uuu = item
									break
								case 'VVV':
									parsedData.vvv = item
									break
								case 'VEC':
									parsedData.windDirection = item
									break
								case 'WSD':
									parsedData.windSpeed = item
									break
							}
							
						}
						let liveDataSchema = {
							timestamp: (new Date()).getTime(),
							data: parsedData
						}
						database.metadata.set(`weather.live.${cellNumber}`, liveDataSchema)
					})
				}, true)
			}
		}catch(e){}

		// 입력되어 있는 날씨 값을 콜백에 전달합니다.
		if(typeof callback === 'function')
			callback(data)
	})
}

export function RequestWeatherData(database, cellNumber, callback, isLazyLoad = false){
	database.metadata.get(`weather.local.${cellNumber}`, (isSuccess, data)=>{

		// 기존 데이터가 없는 경우 또는
		// 데이터 다운로드 시점으로부터 1시간이 지난 경우
		if(!isSuccess || data === null ||
		  (typeof data === 'object'
		   && typeof data['timestamp'] !== 'undefined'
		   && moment(Number(data['timestamp'])).add(1, 'hours') <= moment()) ){

			try{
				// 기상청에서 해당 지역 데이터를 받아옵니다.
				request(`https://www.kma.go.kr/wid/queryDFSRSS.jsp?zone=${cellNumber}`, (error, response, body) => {

					// JSON 형태로 변환합니다.
					parseString(body, (err, result) => {
						Logger.log(`기상청에서 ${result.rss.channel[0].item[0].category[0]}(${cellNumber}) 지역 기상 데이터를 받아왔습니다.`)

						// 순서를 재구성합니다.
						let dailyForeCast = {
							title: result.rss.channel[0].item[0].title[0], // "동네예보(도표) : *시 *구 *1동 [X=0,Y=0]"
							category: result.rss.channel[0].item[0].category[0], // "*시 *구 *동"

							broadcast: Number(result.rss.channel[0].item[0].description[0].header[0].tm[0]), // "201806131400"
							broadcastKR: result.rss.channel[0].pubDate[0], // "2018년 06월 13일 (수)요일 14:00"

							x: Number(result.rss.channel[0].item[0].description[0].header[0].x[0]), // "0"
							y: Number(result.rss.channel[0].item[0].description[0].header[0].y[0]), // "0"

							daily: [] // 3일치 3시간 단위 정보들
						}

						// 3일치 정보 순서를 재구성합니다.
						for(let dailyData of result.rss.channel[0].item[0].description[0].body[0].data){
							dailyForeCast.daily.push({
								day: Number(dailyData.day[0]),  // "0" // +0 +1 +2 일 단위 n번째날
								hour: Number(dailyData.hour[0]), // "18" // 3시간 단위

								temp: Number(dailyData.temp[0]), // "26.0" // 온도
								tempMax: Number(dailyData.tmx[0]), // "-999.0"  // 최고온도
								tempMin: Number(dailyData.tmn[0]), // "-999.0" // 최저온도
								humidity: Number(dailyData.reh[0]), // 55 // 습도%

								cloud: Number(dailyData.sky[0]), // "3"  // 하늘상태 [맑음1, 구름조금2, 구름많음3, 흐림4]
								cloudEN: dailyData.wfEn[0], // "Mostly Cloudy" // 날씨한국어
								cloudKR: dailyData.wfKor[0], // "구름 많음" // 날씨한국어

								weather: Number(dailyData.pty[0]), // "0" // 강수상태 [없음0, 비1, 비/눈2, 눈3]
								probability: Number(dailyData.pop[0]), // "20" // 강수확률
								rainAmountAfter6Hour: Number(dailyData.r06[0]), // "0.0" // 6시간 예상강수량
								rainAmountAfter12Hour: Number(dailyData.r12[0]), // "0.0" // 12시간 예상강수량
								snowAmountAfter6Hour: Number(dailyData.s06[0]), // "0.0" // 6시간 예상적설량
								snowAmountAfter12Hour: Number(dailyData.s12[0]), // "0.0" // 12시간 예상적설량

								windSpeed: Number(dailyData.ws[0]), // "1.8" // 풍속(m/s)
								windDirection: Number(dailyData.wd[0]), // "2" // 풍향
								windDirectionEN: dailyData.wdEn[0], // "동" // 풍향한국어
								windDirectionKR: dailyData.wdKor[0] // "E" // 풍향영어
							})
						}

						let dailyDataSchema = {
							timestamp: (new Date()).getTime(),
							forecast: dailyForeCast
						}
						database.metadata.set(`weather.local.${cellNumber}`, dailyDataSchema)

						if(typeof callback === 'function' && isLazyLoad)
							callback(dailyDataSchema)
					})
				})
				
			}catch(e){}
		}

		// 입력되어 있는 날씨 값을 콜백에 전달합니다.
		if(typeof callback === 'function' && !isLazyLoad)
			callback(data)
	})
}

export function RequestWeatherMapData(database, callback, isLazyLoad = false){
	database.metadata.get(`weather.mapdata`, (isSuccess, data)=>{

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

			request(``, (error, response, body) => {
				
			})
		}

		// 입력되어 있는 날씨 값을 콜백에 전달합니다.
		if(typeof callback === 'function' && !isLazyLoad)
			callback(data)
	})
}

export default function Weather(app, database) {
	app.post(`/api/weather`, (request, response)=>{
		let requestSchema = request.body
		if(requestSchema === undefined || requestSchema === null) {
			Logger.log(`잘못된 유형의 ${this.option.dataName} 발생`)
			response.send(null)
			response.end()
			return
		}

		// x y 좌표가 있으면 한달치 날씨예측정보 반환
		if(typeof requestSchema['x'] !== 'undefined'
		  && typeof requestSchema['y'] !== 'undefined'){

			let x = Number(requestSchema['x'])
			let y = Number(requestSchema['y'])
			
			if(typeof requestSchema['type'] !== 'undefined'){
				if(requestSchema['type'] == 'week'){
						let rootDetailAddress = findRootDetailAddress(x, y)
						RequestWeeklyWeatherData(database, (weeklyDataSchema)=>{
							if(weeklyDataSchema === null || weeklyDataSchema === undefined){
								response.send(null)
								response.end()
								return
							}
							response.send({
								broadcast: weeklyDataSchema.forecast.broadcast,
								description: weeklyDataSchema.forecast.description,
								local: weeklyDataSchema.forecast.location[rootDetailAddress], // x y로 areaDetailName 찾아서 전송
								location: weeklyDataSchema.forecast.location
							})
							response.end()
						})
					return
				}
			}
			RequestMonthlyWeatherData(database, (monthlyDataSchema)=>{
				monthlyDataSchema.address = findRootAddress(x, y)
				response.send(monthlyDataSchema)
				response.end()
			})
			return
		}
		
		// cell 정보가 없으면 null 반환
		if(typeof requestSchema['cell'] === 'undefined'){
			response.send(null)
			response.end()
			return
		}

		// cell 정보가 있으면 실시간 날씨정보 3일치 반환
		let cellNumber = Number(requestSchema['cell'])
		
		// 실시간 정보를 불러옵니다.
		if(typeof requestSchema['type'] !== 'undefined'){
			if(requestSchema['type'] == 'live'){
				RequestLiveWeatherData(database, cellNumber, (liveDataSchema)=>{
					response.send(liveDataSchema)
					response.end()
				})
				return
			}
		}
		RequestWeatherData(database, cellNumber, (dailyDataSchema)=>{
			response.send(dailyDataSchema)
			response.end()
		})
	})

	// 한달치 데이터를 미리 받아놓습니다.
	RequestMonthlyWeatherData(database, (monthlyDataSchema)=>{})
}