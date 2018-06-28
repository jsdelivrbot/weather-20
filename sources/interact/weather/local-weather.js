import API from '../../transmitter/api.js'
import moment from 'moment'

let weatherSlider = null
let infoSlider = null
let graphicSlider = null

let sliderBox = document.getElementById(`local-weather-slider-box`)
let infoBox = document.getElementById(`local-info-slider-box`)
let globalBox = document.getElementById(`global-info-slider-box`)

let isLoaded = false
let isInited = false
let currentSliderSelected = 1

let keyData = [
	'liveWarningData',
	'liveWeatherData',
	'weeklyWeatherData',
	'dailyWeatherData',
	'monthlyWeatherData',
	'liveDustData',
	'dailyDustData',
	'weeklyDustData',
	'weeklyEnteritis',
	'weeklyHeatdata',
	'AWSLiveData'
]

let needToLoadCount = keyData.length
export function weatherParse(paramWeatherGrade, paramCloudGrade){
	//paramCloudGrade
	//맑음(1), 구름조금(2), 구름많음(3), 흐림(4)

	//if(paramWeatherGrade == 0) return '없음'
	//if(paramWeatherGrade == 1) return '비 내림'
	//if(paramWeatherGrade == 2) return '눈비'
	//if(paramWeatherGrade == 3) return '눈 내림'

	let weatherStatus = '맑음'
	let currentDay = moment().get('hours')
	let isNight = currentDay <= 20 && currentDay >= 6

	if(paramCloudGrade == 1){ //구름정보 맑음
		if(paramWeatherGrade == 0) weatherStatus = '맑음'
		if(paramWeatherGrade == 1) weatherStatus = '비'
		if(paramWeatherGrade == 2) weatherStatus = '눈'
		if(paramWeatherGrade == 3) weatherStatus = '눈'
	}
	if(paramCloudGrade == 2){ //구름정보 구름조금
		if(paramWeatherGrade == 0) weatherStatus = '구름조금'
		if(paramWeatherGrade == 1) weatherStatus = '비'
		if(paramWeatherGrade == 2) weatherStatus = '눈'
		if(paramWeatherGrade == 3) weatherStatus = '눈'
	}
	if(paramCloudGrade == 3){ //구름정보 구름많음
		if(paramWeatherGrade == 0) weatherStatus = '구름많음'
		if(paramWeatherGrade == 1) weatherStatus = '비'
		if(paramWeatherGrade == 2) weatherStatus = '눈'
		if(paramWeatherGrade == 3) weatherStatus = '눈'
	}
	if(paramCloudGrade == 4){ //구름정보 흐림
		if(paramWeatherGrade == 0) weatherStatus = '흐림'
		if(paramWeatherGrade == 1) weatherStatus = '흐리고비'
		if(paramWeatherGrade == 2) weatherStatus = '흐리고눈'
		if(paramWeatherGrade == 3) weatherStatus = '흐리고눈'
	}

	let iconId = 15
	if(weatherStatus.indexOf('맑음') !== -1){
		iconId = (isNight) ? 15 : 14
	}else if(weatherStatus.indexOf('구름조금') !== -1){
		iconId = (isNight) ? 13 : 16
	}else if(weatherStatus.indexOf('구름많음') !== -1){
		iconId = (isNight) ? 21 : 12
	}else if(weatherStatus.indexOf('구름많고비') !== -1){
		iconId = (isNight) ? 10 : 22
	}else if(weatherStatus.indexOf('구름많고눈') !== -1){
		iconId = (isNight) ? 20 : 6
	}else if(weatherStatus.indexOf('흐림') !== -1){
		iconId = 11
	}else if(weatherStatus.indexOf('흐리고비') !== -1){
		iconId = (isNight) ? 4 : 22
	}else if(weatherStatus.indexOf('흐리고눈') !== -1){
		iconId = (isNight) ? 20 : 6
	}else if(weatherStatus.indexOf('눈') !== -1){
		iconId = (isNight) ? 20 : 6
	}else if(weatherStatus.indexOf('비') !== -1){
		iconId = 1
	}
	
	return `resources/icons/pack-1/${iconId}.png`
}


export function windDirectionParse(paramDirection){
	if(0 <= paramDirection && paramDirection < 45) return '북동풍'
	if(45 <= paramDirection && paramDirection < 90) return '동풍'
	if(90 <= paramDirection && paramDirection < 135) return '남동풍'
	if(135 <= paramDirection && paramDirection < 180) return '남풍'
	if(180 <= paramDirection && paramDirection < 225) return '남서풍'
	if(225 <= paramDirection && paramDirection < 270) return '서풍'
	if(270 <= paramDirection && paramDirection < 315) return '북서풍'
	if(315 <= paramDirection && paramDirection <= 360) return '북풍'
}

export function ozonGradeParse(paramGrade){
	if(paramGrade == 1) return '좋음'
	if(paramGrade == 2) return '보통'
	if(paramGrade == 3) return '나쁨'
	if(paramGrade == 4) return '매우나쁨'
	return '-'
}
export function ozonColorParse(paramGrade){
	if(paramGrade == 1) return '#fff'
	if(paramGrade == 2) return '#f0c419'
	if(paramGrade == 3) return '#ff6c00'
	if(paramGrade == 4) return 'tomato'
	return '#f0c419'
}

export function enteritisGradeParse(paramGrade){
	if(paramGrade < 55) return '관심'
	if(55 <= paramGrade && paramGrade < 71) return '주의'
	if(71 <= paramGrade && paramGrade < 86) return '경고'
	if(86 <= paramGrade) return '위험'
	return '-'
}

export function enteritisColorParse(paramGrade){
	if(paramGrade < 55) return '#fff'
	if(55 <= paramGrade && paramGrade < 71) return '#f0c419'
	if(71 <= paramGrade && paramGrade < 86) return '#ff6c00'
	if(86 <= paramGrade) return 'tomato'
	return '#f0c419'
}

export function tempIndexColor(paramTemp){
	if(Number(paramTemp) >= 28) return `style="color: #e78d18;text-shadow: 1px 1px #000;"`
	else if(Number(paramTemp) >= 26) return `style="color: #e78d18;text-shadow: 1px 1px #000;"`
	return ''
}

export function dustIndexColor(paramDust){
	if(paramDust == '좋음') return ''
	else if(paramDust == '보통') return ''
	else if(paramDust == '주의') return `style="color: #e78d18;"`
	else if(paramDust == '나쁨') return `style="color: tomato;"`
	return ''
}

export function windSpeedColor(paramWindSpeed){
	if(paramWindSpeed >= 10) return `style="color: tomato;"`
	else if(paramWindSpeed >= 4) return `style="color: #e78d18;"`
	return ``
}

export function rainPercentageColor(paramRainPercentage){
	if(paramRainPercentage >= 80) return `style="color: tomato;"`
	else if(paramRainPercentage >= 60) return `style="color: #e78d18;"`
	return ``
}

export function rainAmountColor(paramRainAmount){
	if(paramRainAmount >= 20) return `style="color: tomato;"`
	else if(paramRainAmount >= 30) return `style="color: #e78d18;"`
	return ``
}

export function currentWeekDayParse(weekDay){
	if(weekDay === 0) return '일'
	if(weekDay === 1) return '월'
	if(weekDay === 2) return '화'
	if(weekDay === 3) return '수'
	if(weekDay === 4) return '목'
	if(weekDay === 5) return '금'
	if(weekDay === 6) return '토'
	return '-'
}

export function getItemHour(currentHour){
	let itemHour = null
	if(currentHour >= 9)
		itemHour = Math.floor((currentHour-9)/3)
	else
		itemHour = Math.floor((currentHour)/3) + 5
	return itemHour
}

export function getDayHour(day, currentHour){
	let itemHour = null
	if(day == 0){
		if(currentHour >= 9)
			itemHour = Math.floor((currentHour-9)/3)
		else
			itemHour = Math.floor((currentHour)/3) + 5
	}else if(day == 1){
		itemHour = 5 + Math.floor((currentHour)/3)
	}else if(day == 2){
		itemHour = 13 + Math.floor((currentHour)/3)
	}
	return itemHour
}

export function getWeatherIcon(hour, paramWeatherStatus){
	let isAM = hour <= 20 && hour >= 6
	let weatherStatus = paramWeatherStatus.split(' ').join('')

	/*
	육상 중기예보
	맑음 15/14

	구름조금 13/16

	구름많음 21/12
	구름많고 비 4/22
	구름많고 비/눈 3
	구름많고 눈/비 3
	구름많고 눈 6

	흐림 8/9
	흐리고 비 4/22

	눈 20
	흐리고 눈/비 3
	흐리고 눈 6
	*/
	let iconId = 15
	if(weatherStatus.indexOf('맑음') !== -1){
		iconId = (isAM) ? 15 : 14
	}else if(weatherStatus.indexOf('구름조금') !== -1){
		iconId = (isAM) ? 13 : 16
	}else if(weatherStatus.indexOf('구름많음') !== -1){
		iconId = (isAM) ? 21 : 12
	}else if(weatherStatus.indexOf('구름많고비') !== -1){
		iconId = (isAM) ? 10 : 22
	}else if(weatherStatus.indexOf('구름많고눈') !== -1){
		iconId = (isAM) ? 20 : 6
	}else if(weatherStatus.indexOf('흐림') !== -1){
		iconId = 11
	}else if(weatherStatus.indexOf('흐리고비') !== -1){
		iconId = (isAM) ? 4 : 22
	}else if(weatherStatus.indexOf('흐리고눈') !== -1){
		iconId = (isAM) ? 20 : 6
	}else if(weatherStatus.indexOf('눈') !== -1){
		iconId = (isAM) ? 20 : 6
	}else if(weatherStatus.indexOf('비') !== -1){
		iconId = 1
	}
	
	return `resources/icons/pack-1/${iconId}.png`
}

export function LocalWeatherRedraw(){
	let liveWarningData = window.armyWeather.private.liveWarningData
	let liveWeatherData = window.armyWeather.private.liveWeatherData
	let dailyWeatherData = window.armyWeather.private.dailyWeatherData
	let weeklyWeatherData = window.armyWeather.private.weeklyWeatherData
	let monthlyWeatherData = window.armyWeather.private.monthlyWeatherData

	let liveDustData = window.armyWeather.private.liveDustData
	let dailyDustData = window.armyWeather.private.dailyDustData
	let weeklyEnteritis = window.armyWeather.private.weeklyEnteritis
	let weeklyHeatdata = window.armyWeather.private.weeklyHeatdata
	let weeklyDustData = window.armyWeather.private.weeklyDustData
	let AWSLiveData = window.armyWeather.private.AWSLiveData

	let temp = '-'
	let weather = '-'
	let amount = '0.0mm'
	let windDirection = '-'
	let lightning = '없음'
	let windSpeed = '-'

	try{
		if(liveWeatherData !== null && liveWeatherData !== undefined){
			// 현재온도
			temp = liveWeatherData.data.temp.obsrValue +'℃'

			// 낙뢰상황
			lightning = (liveWeatherData.data.lightning.obsrValue == 1) ? '있음' : '없음'

			// 기상상태 (TODO 아이콘 처리)
			weather = weatherParse(liveWeatherData.data.weather.obsrValue, liveWeatherData.data.cloud.obsrValue)

			// 풍향 풍속
			windDirection = windDirectionParse(Number(liveWeatherData.data.windDirection.obsrValue))
			windSpeed = liveWeatherData.data.windSpeed.obsrValue + 'm/s'

			// 강우량
			amount = liveWeatherData.data.rainAmountAfter1Hour.obsrValue + 'mm'
		}
	}catch(e){}

	let currentHour = moment().get('hour')
	let itemHour = getItemHour(currentHour)

	document.getElementById('day-weather-info2').innerHTML = temp
	document.getElementById('day-weather-temp-info2').innerHTML = `${windDirection}(${windSpeed})`
	//document.getElementById('day-weather-rain-info4').innerHTML = amount

	if(weather != '-') document.getElementById('day-weather-status-img').src = weather

	let currentTempIndex = '-'
	let currentTempIndexHour = '(-시 기준)'
	if(weeklyHeatdata !== undefined && weeklyHeatdata !== null){
		try{
			while(true){
				if(typeof weeklyHeatdata[itemHour] === 'undefined') break
				if(weeklyHeatdata[itemHour] === 'null'){
					itemHour++
					continue
				}
				
				if(itemHour !== null){
					currentTempIndex = weeklyHeatdata[itemHour]
					currentTempIndexHour = (itemHour*3+9)%24
				}
				break
			}
		}catch(e){}
	}

	document.getElementById('day-weather-info5').innerHTML = currentTempIndex
	document.getElementById('day-weather-info6').innerHTML = `(${currentTempIndexHour}시 기준)`
	
	let ozon = '-'
	let ozonGrade = '(-)'
	let ozonColor = '#fff'
	//ozonColorParse
	
	let pm10 = '-'
	let pm10Grade = '(-)'
	let pm10Color = '#fff'
	let pm25 = '-'
	let pm25Grade = '(-)'
	let pm25Color = '#fff'
	try{
		if(liveDustData !== null && liveDustData !== undefined){
			ozon = liveDustData[0].o3Value
			ozonGrade = `(${ozonGradeParse(liveDustData[0].o3Grade)})`
			ozonColor = ozonColorParse(liveDustData[0].o3Grade)

			if(liveDustData[0]['pm10Value'] != '-'){
				pm10 = liveDustData[0].pm10Value
				pm25 = liveDustData[0].pm25Value
				pm10Grade = `(${ozonGradeParse(liveDustData[0].pm10Grade1h)})`
				pm25Grade = `(${ozonGradeParse(liveDustData[0].pm25Grade1h)})`
				pm10Color = ozonColorParse(liveDustData[0].pm10Grade1h)
				pm25Color = ozonColorParse(liveDustData[0].pm25Grade1h)
			}else{
				pm10 = liveDustData[0].pm10Value24
				pm25 = liveDustData[0].pm25Value24
				pm10Grade = `(${ozonGradeParse(liveDustData[0].pm10Grade)})`
				pm25Grade = `(${ozonGradeParse(liveDustData[0].pm25Grade)})`
				pm10Color = ozonColorParse(liveDustData[0].pm10Grade)
				pm25Color = ozonColorParse(liveDustData[0].pm25Grade)
			}
		}
	}catch(e){}

	document.getElementById('day-weather-temp-info4').innerHTML = ozon
	document.getElementById('day-weather-temp-info5').innerHTML = ozonGrade
	document.getElementById('day-weather-temp-info4').style.color = ozonColor
	document.getElementById('day-weather-temp-info5').style.color = ozonColor
	
	document.getElementById('day-weather-wind-info2').innerHTML = pm10
	document.getElementById('day-weather-wind-info3').innerHTML = pm10Grade
	document.getElementById('day-weather-wind-info2').style.color = pm10Color
	document.getElementById('day-weather-wind-info3').style.color = pm10Color
	
	
	document.getElementById('day-weather-wind-info5').innerHTML = pm25
	document.getElementById('day-weather-wind-info6').innerHTML = pm25Grade
	document.getElementById('day-weather-wind-info5').style.color = pm25Color
	document.getElementById('day-weather-wind-info6').style.color = pm25Color

	document.getElementById(`local-weather-box-outline`).style.background = `rgba(1, 1, 1, 0.2)`

	if(infoSlider != null)
		infoSlider.destroy()
	infoBox.innerHTML = ``
	
	if(weatherSlider != null)
		weatherSlider.destroy()
	sliderBox.innerHTML = ``
	sliderBox.style.zIndex = "1"

	if(graphicSlider != null)
		graphicSlider.destroy()
	globalBox.innerHTML = ``

	let weatherBoxType = document.getElementById('local-weather-box-type')
	weatherBoxType.innerHTML = ''

	//현재 예보 슬라이더
	if(currentSliderSelected == 1){
		try{
			if(dailyWeatherData !== null && dailyWeatherData !== undefined){
				document.getElementById('day-top-weather-box').style.opacity = '1'
				let currentDate = moment()
				let lastAddedDate = null
				// 현재예보 class=local-weather-slider
				let weatherHTML = '<div id=local-weather-slider class=swiper-wrapper>'

				let weatherBoxTypeHTML = `
				<a class="local-weather-context">날짜</a><br>
				<a class="local-weather-context-sub">시간</a><br>
				<br>
				<br>
				<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="opacity:  0;height: 48px;"></img><br>
				<a class="local-weather-context-sub" style="top: 4px;">날씨</a><br>
				<a class="local-weather-context-sub local-weather-context-temp-2" style="font-size: 17px;top: 11px;">온도</a><br>
				<a class="local-weather-context-sub local-weather-context-temp">더위지수</a><br>
				<a class="local-weather-context-sub">강수확률</a><br>
				<a class="local-weather-context-sub">강수량</a><br>
				<a class="local-weather-context-sub">풍속</a><br>
				<a class="local-weather-context-sub">풍향</a><br>
				<a class="local-weather-context-sub">습도</a><br>`

				weatherBoxType.insertAdjacentHTML('beforeend', weatherBoxTypeHTML)

				for(let dailyData of dailyWeatherData.forecast.daily){
					let currentAddDate = '-'
					let currentAddedDateCount = Number(dailyData.day)

					let targetHour = getDayHour(currentAddedDateCount, Number(dailyData.hour))
					let ondoJisu = (weeklyHeatdata.length == 0) ? '-' : weeklyHeatdata[targetHour]

					let nextDate = moment(currentDate).add(currentAddedDateCount, 'days').format('M/D')
					let currentWeekDay = ''
					if(lastAddedDate != nextDate){
						currentAddDate = nextDate
						lastAddedDate = nextDate
						currentWeekDay = `(${(currentWeekDayParse(moment(currentDate).add(currentAddedDateCount, 'days').days()))})`
					}else{
						//if(currentAddedDateCount == 0) currentAddDate = '오늘'
						//else if(currentAddedDateCount == 1) currentAddDate = '내일'
						//else if(currentAddedDateCount == 2) currentAddDate = '모레'
					}

					let rainSnowAmount = '0.0'
					if(dailyData.weather >= 2) rainSnowAmount = dailyData.snowAmountAfter6Hour
						else  rainSnowAmount = dailyData.rainAmountAfter6Hour

					let windSpeed = Number(dailyData.windSpeed).toFixed(1)
					// 아이콘 구현
					weatherHTML += `<div class="swiper-slide"><div class="local-weather-message unselectable">`
					weatherHTML += `<a class="local-weather-context-day local-weather-context">${currentAddDate}${currentWeekDay}` + `</a><br>`
					weatherHTML += `<a class="local-weather-context-sub">${dailyData.hour}시</a><br>`
					weatherHTML += `<br>`
					weatherHTML += `<br>`
					weatherHTML += `<img class=local-weather-context-img src="${getWeatherIcon(dailyData.hour, dailyData.cloudKR)}" class=day-status-img></img><br>`
					weatherHTML += `<a class="local-weather-context-sub" style="top: 4px;">${(dailyData.cloudKR).split(' ').join('')}` + `</a><br>`
					weatherHTML += `<a class="local-weather-context-sub local-weather-context-temp-2" style="font-size: 17px;top: 11px;">${dailyData.temp}℃</a><br>`
					weatherHTML += `<a class="local-weather-context-sub local-weather-context-temp" ${tempIndexColor(ondoJisu)}>${ondoJisu}` + `</a><br>` //온도지수
					weatherHTML += `<a class="local-weather-context-sub" ${rainPercentageColor(dailyData.probability)}>${dailyData.probability}%</a><br>`
					weatherHTML += `<a class="local-weather-context-sub" ${rainAmountColor(rainSnowAmount)}>${rainSnowAmount}mm</a><br>`
					weatherHTML += `<a class="local-weather-context-sub" ${windSpeedColor(windSpeed)}>${windSpeed}m/s</a><br>`
					weatherHTML += `<a class="local-weather-context-sub">${dailyData.windDirectionKR}풍` + `</a><br>`
					weatherHTML += `<a class="local-weather-context-sub">${dailyData.humidity}%` + `</a><br>` //습도
					weatherHTML += `</div></div>`
				}
				weatherHTML += `</div><div class="swiper-scrollbar"></div></div>`
				sliderBox.insertAdjacentHTML('beforeend', weatherHTML)

				weatherSlider = new Swiper('.local-weather-slider', {
					slidesPerView: 6,
					centeredSlides: false,
					grabCursor: true,
					scrollbar: {
						el: '.swiper-scrollbar',
						hide: true,
					}
				})
			}
		}catch(e){}

	// 주간 예보
	}else if(currentSliderSelected == 2){
		try{
			if(weeklyWeatherData !== null && weeklyWeatherData !== undefined){
				let currentDate = moment()

				document.getElementById('day-top-weather-box').style.opacity = '0'

				let weatherBoxTypeHTML = `
				<a class="local-weather-context">날짜</a><br>
				<a class="local-weather-context-sub">시간</a><br>
				<br>
				<br>
				<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="opacity:  0;height: 48px;"></img><br>
				<a class="local-weather-context-sub">날씨</a><br>
				<a class="local-weather-context-sub local-weather-context-temp">최고온도</a><br>
				<a class="local-weather-context-sub local-weather-context-temp">최저온도</a><br>
				<a class="local-weather-context-sub">미세먼지</a><br>
				<a class="local-weather-context-sub">초미세먼지</a><br>
				<a class="local-weather-context-sub">오존상태</a><br>
				<a class="local-weather-context-sub">이산화질소</a><br>
				<a class="local-weather-context-sub">아황산가스</a><br>`

				weatherBoxType.insertAdjacentHTML('beforeend', weatherBoxTypeHTML)

				let weatherHTML = '<div id=local-weather-slider class=swiper-wrapper>'

				/*
					dailyWeatherData.forecast.daily[6],
					dailyWeatherData.forecast.daily[8],

					dailyWeatherData.forecast.daily[14],
					dailyWeatherData.forecast.daily[16]
				*/
				let manualAdds = []

				let isExistToday9ClockData = false
				for(let checkDaily of dailyWeatherData.forecast.daily){
					
					if(checkDaily.day == 0 && checkDaily.hour == 9)
						isExistToday9ClockData = true

					if(isExistToday9ClockData){
						if((checkDaily.day == 0 && checkDaily.hour == 9)
						  || (checkDaily.day == 0 && checkDaily.hour == 15)){

							manualAdds.push(checkDaily)
						}
					}else{

						if(checkDaily.day == 0 && checkDaily.hour == 24)
							manualAdds.push(checkDaily)
					}

					if((checkDaily.day == 1 && checkDaily.hour == 9)
					  || (checkDaily.day == 1 && checkDaily.hour == 15)

					  || (checkDaily.day == 2 && checkDaily.hour == 9)
					  || (checkDaily.day == 2 && checkDaily.hour == 15)){

						manualAdds.push(checkDaily)
					}
				}

				let lastAddedDate = null
				for(let manuaAddIndex in manualAdds){
					let manuaAdd = manualAdds[manuaAddIndex]
					let currentAddDate = '-'
					let currentAddedDateCount = Number(manuaAdd.day)

					let targetHour = getDayHour(currentAddedDateCount, Number(manuaAdd.hour))
					let ondoJisu = (weeklyHeatdata.length == 0) ? '-' : weeklyHeatdata[targetHour]

					let currentWeekDay = ''
					let nextDate = moment(currentDate).add(currentAddedDateCount, 'days').format('M/D')
					if(lastAddedDate != nextDate){
						currentAddDate = nextDate
						lastAddedDate = nextDate
						currentWeekDay = `(${(currentWeekDayParse(moment(currentDate).add(currentAddedDateCount, 'days').days()))})`
					}else{
						//if(currentAddedDateCount == 0) currentAddDate = '오늘'
						//else if(currentAddedDateCount == 1) currentAddDate = '내일'
						//else if(currentAddedDateCount == 2) currentAddDate = '모레'
					}

					let isAM = manuaAdd.hour <= 12
					let isAMPM = isAM ? '오전' : '오후'
					let contextOption = (currentAddDate == '-') ? 'local-weather-context-hide' : 'local-weather-context-center'

					let isNeedToMakeSolo = false
					// 다음 날 정보가 없거나
					if(!isNeedToMakeSolo){
						if(typeof manualAdds[Number(manuaAddIndex)+1] == 'undefined')
							isNeedToMakeSolo = true
					}
					// 다음 정보가 오늘이랑 날짜가 다르면
					if(!isNeedToMakeSolo){
						if(manualAdds[Number(manuaAddIndex)+1].day != manuaAdd.day)
							isNeedToMakeSolo = true
					}
					if(isNeedToMakeSolo){
						if(contextOption == 'local-weather-context-center')
						contextOption = ''
						currentWeekDay = ''
					}

					let tempMax = manuaAdd.tempMax
					let tempMin = manuaAdd.tempMin
					if(tempMax == '-999' || tempMax == '999' ) tempMax = '-'
					if(tempMin == '-999' || tempMin == '999' ) tempMin = '-'

					// 25일 자료일 때
					//let parsedWeeklyDate = moment(Number(weeklyDustData.timestamp)).get('days')
					let currentNum = null
					for(let loopCheckNum = 0; loopCheckNum<=4; loopCheckNum++){
						let parsedWeeklyDate = moment(Number(weeklyDustData.timestamp)).add(loopCheckNum, 'days').format('M/D')
						let parsedCurrentDate= moment(currentDate).add(currentAddedDateCount, 'days').format('M/D')
						if(parsedCurrentDate == parsedWeeklyDate){
							currentNum = loopCheckNum
							break
						}
					}
					let innerPM10 = '-'
					let innerPM2_5 = '-'
					let innerOzon = '-'
					let innerSO2 = '-'
					let innerNO2 = '-'
					if(currentNum !== null){
						innerPM10 = weeklyDustData['grade']['pm10'][currentNum]
						innerPM2_5 = weeklyDustData['grade']['pm2_5'][currentNum]
						innerOzon = weeklyDustData['grade']['ozon'][currentNum]
						innerSO2 = weeklyDustData['grade']['so2'][currentNum]
						innerNO2 = weeklyDustData['grade']['no2'][currentNum]
					}

					weatherHTML += `<div class="swiper-slide"><div class="local-weather-message unselectable">`
					weatherHTML += `<a class="local-weather-context-day local-weather-context ${contextOption}">${currentAddDate}${currentWeekDay}` + `</a><br>`
					weatherHTML += `<a class="local-weather-context-sub">${isAMPM}` + `</a><br>`
					weatherHTML += `<br>`
					weatherHTML += `<br>`
					weatherHTML += `<img class=local-weather-context-img src="${getWeatherIcon(manuaAdd.hour, manuaAdd.cloudKR)}" class=day-status-img></img><br>`
					weatherHTML += `<a class="local-weather-context-sub">${(manuaAdd.cloudKR).split(' ').join('')}` + `</a><br>`
					weatherHTML += `<a class="local-weather-context-sub local-weather-context-temp" ${tempIndexColor(tempMax)}>${tempMax}℃</a><br>`
					weatherHTML += `<a class="local-weather-context-sub local-weather-context-temp">${tempMin}℃</a><br>`
					weatherHTML += `<a class="local-weather-context-sub" ${dustIndexColor(innerPM10)}>${innerPM10}`+`</a><br>`
					weatherHTML += `<a class="local-weather-context-sub" ${dustIndexColor(innerPM2_5)}>${innerPM2_5}`+`</a><br>`
					weatherHTML += `<a class="local-weather-context-sub" ${dustIndexColor(innerOzon)}>${innerOzon}` + `</a><br>`
					weatherHTML += `<a class="local-weather-context-sub" ${dustIndexColor(innerSO2)}>${innerSO2}` + `</a><br>`
					weatherHTML += `<a class="local-weather-context-sub" ${dustIndexColor(innerNO2)}>${innerNO2}` + `</a><br>`
					weatherHTML += `</div></div>`
				}
				
				for(let weeklyDataIndex in weeklyWeatherData.local){
					let weeklyData = weeklyWeatherData.local[weeklyDataIndex]
					let currentTimeParse = weeklyData.tmEf[0].split(' ')
					let currentDay = `${currentTimeParse[0].split('-')[1]}/${currentTimeParse[0].split('-')[2]}`
					let currentDate = moment(currentTimeParse[0])
					let currentWeekDay = `(${(currentWeekDayParse(moment(currentDate).days()))})`

					let isAM = currentTimeParse[1] == '00:00'
					let isAMPM = isAM ? '오전' : '오후'
					if(!isAM){
						currentDay = '-'
						currentWeekDay = ''
					}
					let contextOption = (currentDay == '-') ? 'local-weather-context-hide' : 'local-weather-context-center'
					if(isAM){
						let isNeedToMakeSolo = false
						// 다음 날 정보가 없거나
						if(!isNeedToMakeSolo){
							if(typeof weeklyWeatherData.local[Number(weeklyDataIndex)+1] == 'undefined')
								isNeedToMakeSolo = true
						}
						// 다음날도 AM 정보면
						if(!isNeedToMakeSolo){
							if(weeklyWeatherData.local[Number(weeklyDataIndex)+1].tmEf[0].split(' ')[1] == '00:00')
								isNeedToMakeSolo = true
						}
						if(isNeedToMakeSolo){
							contextOption = ''
							currentWeekDay = ''
						}
					}
					let currentNum = null
					for(let loopCheckNum = 0; loopCheckNum<=4; loopCheckNum++){
						let parsedWeeklyDate = moment(Number(weeklyDustData.timestamp)).add(loopCheckNum, 'days').format('M/D')
						let parsedCurrentDate= moment(currentDate).format('M/D')
						if(parsedCurrentDate == parsedWeeklyDate){
							currentNum = loopCheckNum
							break
						}
					}
					let innerPM10 = '-'
					let innerPM2_5 = '-'
					let innerOzon = '-'
					let innerSO2 = '-'
					let innerNO2 = '-'
					if(currentNum !== null){
						innerPM10 = weeklyDustData['grade']['pm10'][currentNum]
						innerPM2_5 = weeklyDustData['grade']['pm2_5'][currentNum]
						innerOzon = weeklyDustData['grade']['ozon'][currentNum]
						innerSO2 = weeklyDustData['grade']['so2'][currentNum]
						innerNO2 = weeklyDustData['grade']['no2'][currentNum]
					}

					// 아이콘 구현
					weatherHTML += `<div class="swiper-slide"><div class="local-weather-message unselectable">`
					weatherHTML += `<a class="local-weather-context-day local-weather-context ${contextOption}">${currentDay}${currentWeekDay}` + `</a><br>`
					weatherHTML += `<a class="local-weather-context-sub">${isAMPM}` + `</a><br>`
					weatherHTML += `<br>`
					weatherHTML += `<br>`
					weatherHTML += `<img class=local-weather-context-img src="${getWeatherIcon(currentDate.get('hours'), weeklyData.wf[0])}" class=day-status-img></img><br>`
					weatherHTML += `<a class="local-weather-context-sub">${(weeklyData.wf[0]).split(' ').join('')}` + `</a><br>`
					weatherHTML += `<a class="local-weather-context-sub local-weather-context-temp" ${tempIndexColor(weeklyData.tmx[0])}>${weeklyData.tmx[0]}℃</a><br>`
					weatherHTML += `<a class="local-weather-context-sub local-weather-context-temp">${weeklyData.tmn[0]}℃</a><br>`
					weatherHTML += `<a class="local-weather-context-sub" ${dustIndexColor(innerPM10)}>${innerPM10}`+`</a><br>`
					weatherHTML += `<a class="local-weather-context-sub" ${dustIndexColor(innerPM2_5)}>${innerPM2_5}`+`</a><br>`
					weatherHTML += `<a class="local-weather-context-sub" ${dustIndexColor(innerOzon)}>${innerOzon}` + `</a><br>`
					weatherHTML += `<a class="local-weather-context-sub" ${dustIndexColor(innerSO2)}>${innerSO2}` + `</a><br>`
					weatherHTML += `<a class="local-weather-context-sub" ${dustIndexColor(innerNO2)}>${innerNO2}` + `</a><br>`
					weatherHTML += `</div></div>`
				}
				weatherHTML += `</div><div class="swiper-scrollbar"></div></div>`

				sliderBox.insertAdjacentHTML('beforeend', weatherHTML)

				weatherSlider = new Swiper('.local-weather-slider', {
					slidesPerView: 6,
					centeredSlides: false,
					spaceBetween: 0,
					grabCursor: true,
					scrollbar: {
						el: '.swiper-scrollbar',
						hide: true,
					}
				})

				let dustDescription2dayAfter = (window.armyWeather.private.dailyDustData.data[2].reason).split('[미세먼지]').join('')
				dustDescription2dayAfter = dustDescription2dayAfter.length == 0 ? '' : `(${dustDescription2dayAfter})`

				let infoHTML = `
				<div class="swiper-wrapper">
				<div class="swiper-slide local-info-text">`
				+`<br/><h2>[실시간 기상전망]</h2>
				<h4>[${liveWarningData.reports.news.title}]</h4><br/>
				${liveWarningData.reports.news.context.split('<br /><br />').join('<br/><br/>').split('<br />').join('').split(`( 기상 현황과 전망 )`).join(``)}`
				+`<br/><br/><h2>[실시간 기상정보]</h2>
				<h4>[${liveWarningData.reports.info.title}]</h4><br/>
				${liveWarningData.reports.info.context.split('<br /><br />').join('<br/><br/>').split('<br />').join('')}`
				+`<br/><br/><h2>[전국주간 기상예보]</h2><br/>
				${weeklyWeatherData.description.split('<br /><br />').join('<br/><br/>').split('<br />').join('')}`
				+`</div>`

				infoHTML += `</div><div class="swiper-scrollbar"></div>`
				infoBox.insertAdjacentHTML('beforeend', infoHTML)

				infoSlider = new Swiper('.local-info', {
					direction: 'vertical',
					slidesPerView: 'auto',
					freeMode: true,
					scrollbar: {
						el: '.swiper-scrollbar',
						hide: false,
					},
					mousewheel: true,
				})
			}
		}catch(e){
			console.log(e)
		}
	}else if(currentSliderSelected == 3){
		try{
			if(monthlyWeatherData !== null && monthlyWeatherData !== undefined){
				document.getElementById('day-top-weather-box').style.opacity = '0'

				let infoHTML = `
				<div class="swiper-wrapper">
				<div class="swiper-slide local-info-text">`
				+`<br/><h2>[한달기상예보]</h2><br/>`
				+`[${monthlyWeatherData.forecast.title}]<br/>`
				+`[${monthlyWeatherData.forecast.targetDate}]<br/>`
				+`${monthlyWeatherData.forecast.summary}`+`<br/><br/>`
				
				for(let reviewIndex in monthlyWeatherData.forecast.review){
					let review = monthlyWeatherData.forecast.review[reviewIndex]
					infoHTML += `[${review.period}]<br/>${review.review}`+`<br/>`
					
					let rainTell = ``
					for(let areaName of Object.keys(monthlyWeatherData.forecast.rain)){
						let rainPercentage = monthlyWeatherData.forecast.rain[areaName][Number(reviewIndex)]['similarRange']+`mm`
						rainTell += `${areaName}:${rainPercentage} `
					}

					let tempTell = ``
					for(let areaName of Object.keys(monthlyWeatherData.forecast.temp)){
						let tempPercentage = monthlyWeatherData.forecast.temp[areaName][Number(reviewIndex)]['similarRange']+`℃`
						tempTell += `${areaName}:${tempPercentage} `
					}

					infoHTML += `<br/>주평균기온:<br/>(${tempTell})<br/><br/>주강수량:<br/>(${rainTell})`
					infoHTML += `<br/><br/>`
				}

				infoHTML += `</div>`
				infoHTML += `</div><div class="swiper-scrollbar"></div>`
				sliderBox.style.zIndex = "0"
				infoBox.insertAdjacentHTML('beforeend', infoHTML)

				infoSlider = new Swiper('.local-info', {
					direction: 'vertical',
					slidesPerView: 'auto',
					freeMode: true,
					scrollbar: {
						el: '.swiper-scrollbar',
						hide: false,
					},
					mousewheel: true,
				})

				// 그래픽 슬라이더 구현
				document.getElementById(`local-weather-box-outline`).style.background = `#fff`
				let globalHTML = '<div class=swiper-wrapper>'

				// 현재 전국날씨 슬라이드 구현
				+ `<div class="swiper-slide">`
				+ `<img id=global-weather-img1 src="/resources/images/map.png" class=global-weather-img></img>`
				+ `<div id="global-weather-title" style="color: #516d77;"><p>현재 전국날씨</p></div>`

				// 인천
				+ `<div class="global-weather-box" style="top: 59px;left: 102px;">
						<div class="global-weather-item1">인천</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25</div>
					</div>`
				// 서울
				+ `<div class="global-weather-box" style="top: 40px;left: 159px;">
						<div class="global-weather-item1">서울</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25</div>
					</div>`

				// 춘천
				+ `<div class="global-weather-box" style="top: 25px;left: 215px;">
						<div class="global-weather-item1">춘천</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25</div>
					</div>`
				
				// 수원
				+ `<div class="global-weather-box" style="top: 110px;left: 143px;">
						<div class="global-weather-item1">수원</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25</div>
					</div>`

				// 강릉
				+ `<div class="global-weather-box" style="top: 41px;left: 277px;">
						<div class="global-weather-item1">강릉</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25</div>
					</div>`

				// 광주
				+ `<div class="global-weather-box" style="top: 297px;left: 148px;">
						<div class="global-weather-item1">광주</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25</div>
					</div>`

				// 대구
				+ `<div class="global-weather-box" style="top: 185px;left: 271px;">
						<div class="global-weather-item1">대구</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25</div>
					</div>`

				// 대전
				+ `<div class="global-weather-box" style="top: 161px;left: 202px;">
						<div class="global-weather-item1">대전</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25</div>
					</div>`
				// 목포
				+ `<div class="global-weather-box" style="top: 243px;left: 103px;">
						<div class="global-weather-item1">목포</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25</div>
					</div>`
				// 부산
				+ `<div class="global-weather-box" style="top: 261px;left: 269px;">
						<div class="global-weather-item1">부산</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25</div>
					</div>`
				// 세종
				+ `<div class="global-weather-box" style="top: 174px;left: 135px;">
						<div class="global-weather-item1">세종</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25℃</div>
					</div>`
				// 여수
				+ `<div class="global-weather-box" style="top: 290px;left: 206px;">
						<div class="global-weather-item1">여수</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25℃</div>
					</div>`
				// 울산
				+ `<div class="global-weather-box" style="top: 219px;left: 331px;">
						<div class="global-weather-item1">울산</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25</div>
					</div>`
				// 원주
				+ `<div class="global-weather-box" style="top: 91px;left: 209px;">
						<div class="global-weather-item1">원주</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25</div>
					</div>`
				// 전주
				+ `<div class="global-weather-box" style="top: 230px;left: 188px;">
						<div class="global-weather-item1">전주</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25℃</div>
					</div>`
				// 충주
				+ `<div class="global-weather-box" style="top: 113px;left: 268px;">
						<div class="global-weather-item1">충주</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25</div>
					</div>`
				// 제주
				+ `<div class="global-weather-box" style="top: 297px;left: 3px;">
						<div class="global-weather-item1">제주</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25</div>
					</div>`
				// 울릉
				+ `<div class="global-weather-box" style="top: 95px;left: 342px;">
						<div class="global-weather-item1">울릉</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25</div>
					</div>`
				// 독도
				+ `<div class="global-weather-box" style="top: 114px;left: 390px;">
						<div class="global-weather-item1">독도</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="height: 15PX;width:  15PX;">
						</div>
						<div class="global-weather-item3">17~25</div>
					</div>`

				// 슬라이드 끝
				+ `</div>`


				// 전국기온예보 슬라이드 구현
				+ `<div class="swiper-slide">`
				+ `<img id=global-weather-img2 src="/resources/gif/temp.gif" class=global-weather-img></img>`
				+ `<div id=global-weather-title><p>전국기온예보</p></div>`
				+ `<div id=global-weather-img3><img src="/resources/gif/temp.gif" class=global-weather-img></img></div>`
				+ `<div id=global-weather-img4><img src="/resources/gif/temp.gif" class=global-weather-img></img></div>`
				+ `<div id="global-weather-count"><p style="
					color: #c80000;
					text-shadow: 1px 1px #ff9191;
				">35℃<br></p><p style="
					color: #ca0;
					text-shadow: 1px 1px #fffffd;
				">30℃<br></p><p style="
					color: #008000;
					text-shadow: 1px 1px #69fc69;
				">25℃<br></p><p style="
					color: #0077b3;
					text-shadow: 1px 1px #ffffff;
				">20℃<br></p><p style="
					color: #000390;
					text-shadow: 1px 1px #ffffff;
				">15℃<br></p><p style="
					color: #7f00bf;
					text-shadow: 1px 1px #ffffff;
				">10℃<br></p><p style="
					color: #b71fff;
					text-shadow: 1px 1px #ffffff;
				">5℃</p></div>`
				+ `<div id=global-weather-fill></div>`
				+ `</div>`

				// 전국최고기온 슬라이드 구현
				+ `<div class="swiper-slide">`
				+ `<img id=global-weather-img2 src="/resources/gif/tempmax.gif" class=global-weather-img></img>`
				+ `<div id=global-weather-title-year><p>최고기온예보</p></div>`
				+ `<div id=global-weather-img3-year><img src="/resources/gif/tempmax.gif" class=global-weather-img></img></div>`
				+ `<div id=global-weather-img4><img src="/resources/gif/tempmax.gif" class=global-weather-img></img></div>`
				+ `<div id="global-weather-count"><p style="
					color: #c80000;
					text-shadow: 1px 1px #ff9191;
				">35℃<br></p><p style="
					color: #ca0;
					text-shadow: 1px 1px #fffffd;
				">30℃<br></p><p style="
					color: #008000;
					text-shadow: 1px 1px #69fc69;
				">25℃<br></p><p style="
					color: #0077b3;
					text-shadow: 1px 1px #ffffff;
				">20℃<br></p><p style="
					color: #000390;
					text-shadow: 1px 1px #ffffff;
				">15℃<br></p><p style="
					color: #7f00bf;
					text-shadow: 1px 1px #ffffff;
				">10℃<br></p><p style="
					color: #b71fff;
					text-shadow: 1px 1px #ffffff;
				">5℃</p></div>`
				+ `<div id=global-weather-fill></div>`
				+ `</div>`

				// 전국강수량 슬라이드 구현
				+ `<div class="swiper-slide">`
				+ `<img id=global-weather-img2 src="/resources/gif/rainamount.gif" class=global-weather-img></img>`
				+ `<div id=global-weather-title-year><p>전국강수량예보</p></div>`
				+ `<div id=global-weather-img3-year><img src="/resources/gif/rainamount.gif" class=global-weather-img></img></div>`
				+ `<div id=global-weather-img4><img src="/resources/gif/rainamount.gif" class=global-weather-img></img></div>`
				+ `<div id="global-weather-count" style="
					line-height: 50px;
				"><p style="
					color: #333333;
					text-shadow: 1px 1px #e2e2e2;
				">70mm<br></p><p style="
					color: #f53e3e;
					text-shadow: 1px 1px #fffffd;
				">40mm<br></p><p style="
					color: #ad07fe;
					text-shadow: 1px 1px #ffffff;
				">20mm<br></p><p style="
					color: #4c4eb1;
					text-shadow: 1px 1px #ffffff;
				">10mm<br></p><p style="
					color: #07abff;
					text-shadow: 1px 1px #ffffff;
				">5mm<br></p><p style="
					color: #00d000;
					text-shadow: 1px 1px #ffffff;
				">1mm<br></p><p style="
					color: #f8cd00;
					text-shadow: 1px 1px #ffffff;
				">0mm</p></div>`
				+ `<div id=global-weather-fill></div>`
				+ `</div>`

				// 전국강수확률 슬라이드 구현
				+ `<div class="swiper-slide">`
				+ `<img id=global-weather-img2 src="/resources/gif/rain.gif" class=global-weather-img></img>`
				+ `<div id=global-weather-title-year><p>강수확률예보</p></div>`
				+ `<div id=global-weather-img3-year><img src="/resources/gif/rain.gif" class=global-weather-img></img></div>`
				+ `<div id=global-weather-img4><img src="/resources/gif/rain.gif" class=global-weather-img></img></div>`
				+ `<div id="global-weather-count" style="
					line-height: 67px;
					top: -618px;
				"><p style="
					color: #8103ca;
					text-shadow: 1px 1px #e2e2e2;
				">100%<br></p><p style="
					color: #020692;
					text-shadow: 1px 1px #fffffd;
				">80%<br></p><p style="
					color: #077ac2;
					text-shadow: 1px 1px #ffffff;
				">60%<br></p><p style="
					color: #018701;
					text-shadow: 1px 1px #ffffff;
				">40%<br></p><p style="
					color: #d4b002;
					text-shadow: 1px 1px #ffffff;
				">20%<br></p><p style="
					color: #d2b000;
					text-shadow: 1px 1px #ffffff;
				">0%<br></p></div>`
				+ `<div id=global-weather-fill></div>`
				+ `</div>`

				// 전국하늘상태 슬라이드 구현
				+ `<div class="swiper-slide">`
				+ `<img id=global-weather-img2 src="/resources/gif/sky.gif" class=global-weather-img></img>`
				+ `<div id="global-weather-title-year" style="color: #008eaa;"><p>하늘상태예보</p></div>`
				+ `<div id="global-weather-img3-year" style="filter: hue-rotate(-55deg);"><img src="/resources/gif/sky.gif" class="global-weather-img"></div>`
				+ `<div id=global-weather-img4><img src="/resources/gif/sky.gif" class=global-weather-img></img></div>`
				+ `<div id="global-weather-count" style="
					line-height: 89px;
					top: -631px;
					/* writing-mode: vertical-lr; */
					width: 38px;
					text-align: left;
				"><p style="
					color: #3e7a9a;
					text-shadow: 1px 1px #e2e2e2;
				">흐림<br></p><p style="
					color: #6fa1bd;
					text-shadow: 1px 1px #fffffd;
				">구름많음<br></p><p style="
					color: #b5d1e2;
					text-shadow: 1px 1px #ffffff;
				">구름조금<br></p><p style="
					color: #b5d1e2;
					text-shadow: 1px 1px #ffffff;
				">맑음<br></p></div>`
				+ `<div id=global-weather-fill></div>`
				+ `</div>`

				// 전국파고상태 슬라이드 구현
				+ `<div class="swiper-slide">`
				+ `<img id=global-weather-img2 src="/resources/gif/wave.gif" class=global-weather-img></img>`
				+ `<div id="global-weather-title-year" style="color: #6b4300;"><p>전국파고예보</p></div>`
				+ `<div id="global-weather-img3-year" style="filter: hue-rotate(170deg);"><img src="/resources/gif/wave.gif" class="global-weather-img"></div>`
				+ `<div id=global-weather-img4><img src="/resources/gif/wave.gif" class=global-weather-img></img></div>`
				+ `<div id="global-weather-count"><p style="
					color: #c80000;
					text-shadow: 1px 1px #ff9191;
				">12m<br></p><p style="
					color: #7f08ca;
					text-shadow: 1px 1px #fffffd;
				">10m<br></p><p style="
					color: #13109a;
					text-shadow: 1px 1px #ffffff;
				">8m<br></p><p style="
					color: #0077b3;
					text-shadow: 1px 1px #ffffff;
				">6m<br></p><p style="
					color: #047904;
					text-shadow: 1px 1px #ffffff;
				">4m<br></p><p style="
					color: #cea900;
					text-shadow: 1px 1px #ffffff;
				">2m<br></p><p style="
					color: #cdaa00;
					text-shadow: 1px 1px #ffffff;
				">0m</p></div>`
				+ `<div id=global-weather-fill></div>`
				+ `</div>`

				// 전국습도 슬라이드 구현
				+ `<div class="swiper-slide">`
				+ `<img id=global-weather-img2 src="/resources/gif/humidity.gif" class=global-weather-img></img>`
				+ `<div id=global-weather-title-year><p>전국습도예보</p></div>`
				+ `<div id=global-weather-img3-year><img src="/resources/gif/humidity.gif" class=global-weather-img></img></div>`
				+ `<div id=global-weather-img4><img src="/resources/gif/humidity.gif" class=global-weather-img></img></div>`
				+ `<div id="global-weather-count" style="
					line-height: 67px;
					top: -618px;
				"><p style="
					color: #0f1298;
					text-shadow: 1px 1px #e2e2e2;
				">100%<br></p><p style="
					color: #007db6;
					text-shadow: 1px 1px #fffffd;
				">80%<br></p><p style="
					color: #009000;
					text-shadow: 1px 1px #ffffff;
				">60%<br></p><p style="
					color: #d4bb05;
					text-shadow: 1px 1px #ffffff;
				">40%<br></p><p style="
					color: #c50101;
					text-shadow: 1px 1px #ffffff;
				">20%<br></p><p style="
					color: #f44141;
					text-shadow: 1px 1px #ffffff;
				">0%<br></p></div>`
				+ `<div id=global-weather-fill></div>`
				+ `</div>`

				globalHTML += `</div><div class="swiper-scrollbar"></div>`
				globalBox.insertAdjacentHTML('beforeend', globalHTML)

				graphicSlider = new Swiper('.global-info-slider', {
					slidesPerView: 'auto',
					centeredSlides: false,
					grabCursor: true,
					scrollbar: {
						el: '.swiper-scrollbar',
						hide: true,
					},
					on: {
						slideChange: ()=>{
							console.log(`전국예보 슬라이드 넘김감지: ${graphicSlider.activeIndex}`)
						}
					}
				})
			}
		}catch(e){}
	}else if(currentSliderSelected == 4){
		try{
			if(monthlyWeatherData !== null && monthlyWeatherData !== undefined){
				document.getElementById('day-top-weather-box').style.opacity = '0'

				let dustDescription2dayAfter = (window.armyWeather.private.dailyDustData.data[2].reason).split('[미세먼지]').join('')
				dustDescription2dayAfter = dustDescription2dayAfter.length == 0 ? '' : `(${dustDescription2dayAfter})`

				let infoHTML = `
				<div class="swiper-wrapper">
				<div class="swiper-slide local-info-text">`
				+`<br/><h2>[한국환경공단 미세먼지 예보]</h2>`
				+`<br/>[${dailyDustData.data[0].time}]<br/>${(dailyDustData.data[0].description).split('[미세먼지]').join('')}<br/>(${(dailyDustData.data[0].reason).split('[미세먼지]').join('')})`
				+`<br/><br/>[${dailyDustData.data[1].time}]<br/>${(dailyDustData.data[1].description).split('[미세먼지]').join('')} <br/>(${(dailyDustData.data[1].reason).split('[미세먼지]').join('')})`
				+`<br/><br/>[${dailyDustData.data[2].time}]<br/>${(dailyDustData.data[2].description).split('[미세먼지]').join('')} <br/>${dustDescription2dayAfter}`

				infoHTML += `</div>`
				infoHTML += `</div><div class="swiper-scrollbar"></div>`
				sliderBox.style.zIndex = "0"
				infoBox.insertAdjacentHTML('beforeend', infoHTML)

				infoSlider = new Swiper('.local-info', {
					direction: 'vertical',
					slidesPerView: 'auto',
					freeMode: true,
					scrollbar: {
						el: '.swiper-scrollbar',
						hide: false,
					},
					mousewheel: true,
				})
			}
		}catch(e){
			console.log(e)
		}
	}
	
	if(AWSLiveData !== undefined && AWSLiveData !== null){

		let liveTemp = `-`
		let liveAmount = `-`
		try{

			// 현재온도
			if(AWSLiveData.temp !== undefined)
				liveTemp = AWSLiveData.temp +'℃'
			if(AWSLiveData.rainDay !== undefined)
				liveAmount = AWSLiveData.rainDay + 'mm'
		}catch(e){}

		document.getElementById(`day-weather-info2`).innerHTML = liveTemp
		document.getElementById(`day-weather-rain-info4`).innerHTML = liveAmount
	}
	
	if(liveWarningData !== null && liveWarningData !== undefined){
		//console.log(`liveWarningData:`)
		//console.log(liveWarningData)
	}

	/*
	+ `<div class="swiper-slide">`
	+ `<img id=global-weather-img src="http://www.airkorea.or.kr/file/viewImage2/?fileNm=dust/9F403BC9AE26422595835AA63B750B82&key=a6622a10-5e70-41f4-a006-3de6c4b08841" class=global-weather-img></img>`
	+ `</div>`
	*/

	let enteritisIndex = '-'
	let enteritisGrade = '-'
	let enteritisColor = '#fff'

	try{
		if((weeklyHeatdata.length != 0)){
			enteritisIndex = weeklyEnteritis[0]
			enteritisGrade = enteritisGradeParse(Number(enteritisIndex))
			enteritisColor = enteritisColorParse(Number(enteritisIndex))
		}
	}catch(e){}

	document.getElementById('day-weather-rain-info2').innerHTML = enteritisIndex // 식중독지수
	document.getElementById('day-weather-rain-info2').style.color = enteritisColor
	document.getElementById('day-weather-rain-info5').style.color = enteritisColor
	
	document.getElementById('day-weather-rain-info5').innerHTML = `(${enteritisGrade})`

	document.getElementById('weather-type-currently').style.background = (currentSliderSelected == 1) ? '#28505f' : '#859ba4'
	document.getElementById('weather-type-weekly').style.background = (currentSliderSelected == 2) ? '#28505f' : '#859ba4'
	document.getElementById('weather-type-korea').style.background = (currentSliderSelected == 3) ? '#28505f' : '#859ba4'
	document.getElementById('weather-type-dust').style.background = (currentSliderSelected == 4) ? '#28505f' : '#859ba4'
}

export function LocalWeatherDataLoader(schema){
	let innerLoader = (dataNames)=>{
		for(let dataName of dataNames){
			if(typeof schema[dataName] != 'undefined'){
				window.armyWeather.private[dataName] = schema[dataName]
				needToLoadCount--
				if(needToLoadCount == 0){
					isLoaded = true
					LocalWeatherRedraw()
					break
				}
			}
		}
	}
	
	innerLoader(keyData)
}


export function LocalWeatherUpdate (){

	// 만약 기본 주소가 설정되어 있지 않은 상태라면
	// 아이피 주소를 기반으로 좌표를 찾아낸 후
	// 해당 좌표를 기반으로 주소를 찾아내는 작업을 시도합니다.

	if(window.armyWeather.private.address.main === null){
		window.armyWeather.util.geoip((geoIpData)=>{
			if(typeof geoIpData['lat'] != 'undefined'
				|| typeof geoIpData['lon'] != 'undefined'){

				let clientLat = geoIpData['lat']
				let clientLong = geoIpData['lon']

				// 기상청 cell 정보와 기본 시군구 정보를 얻어옵니다.
				API.call('/api/address',{coord:[clientLat, clientLong]},(paramData)=>{

					window.armyWeather.private.address.main = paramData.data
					// document.getElementById(`day-weather-location-info2`).innerHTML = paramData.data.key.split('.').join(' ')

					// 위치를 다 찾아내고 반영하였다면
					// 계속해서 날씨 정보를 얻어옵니다.
					LocalWeatherUpdate()
				})
			}
		})
		return
	}

	needToLoadCount = keyData.length

	API.call('/api/weather', {
		cell: window.armyWeather.private.address.main.cell,
		type: 'live'
	}, (liveWeatherData)=>{

		LocalWeatherDataLoader({liveWeatherData})
	})
	API.call('/api/weather', {
		x: Number(window.armyWeather.private.address.main.lat),
		y: Number(window.armyWeather.private.address.main.long),
		type: 'week'
	}, (weeklyWeatherData)=>{

		LocalWeatherDataLoader({weeklyWeatherData})
	})

	// 미세먼지 정보를 얻어옵니다.
	API.call('/api/dust', {
		x: Number(window.armyWeather.private.address.main.lat),
		y: Number(window.armyWeather.private.address.main.long)
	}, (liveDustData)=>{

		LocalWeatherDataLoader({liveDustData})
	})

	API.call('/api/heatdata', {
		x: Number(window.armyWeather.private.address.main.lat),
		y: Number(window.armyWeather.private.address.main.long)
	}, (weeklyHeatdata)=>{

		if(weeklyHeatdata[21] === "null"){
			for(let i=1;i<=4;i++){
				weeklyHeatdata.pop()
				weeklyHeatdata.unshift("null")
			}
		}
		
		LocalWeatherDataLoader({weeklyHeatdata})
	})

	API.call('/api/enteritis', {
		x: Number(window.armyWeather.private.address.main.lat),
		y: Number(window.armyWeather.private.address.main.long)
	}, (weeklyEnteritis)=>{

		LocalWeatherDataLoader({weeklyEnteritis})
	})

	// 날씨 정보를 얻어옵니다. (실시간 3일치 데이터)
	API.call('/api/weather', {
		cell: window.armyWeather.private.address.main.cell
	}, (dailyWeatherData)=>{

		LocalWeatherDataLoader({dailyWeatherData})
	})

	// 날씨 정보를 얻어옵니다. (4주치 데이터)
	API.call('/api/weather', {
		x: Number(window.armyWeather.private.address.main.lat),
		y: Number(window.armyWeather.private.address.main.long)
	}, (monthlyWeatherData)=>{
		
		LocalWeatherDataLoader({monthlyWeatherData})
	})

	API.call('/api/dust', {
		x: Number(window.armyWeather.private.address.main.lat),
		y: Number(window.armyWeather.private.address.main.long),
		type: '3days'
	}, (dailyDustData)=>{

		LocalWeatherDataLoader({dailyDustData})
	})

	API.call('/api/dustpic', {}, (weeklyDustData)=>{
		LocalWeatherDataLoader({weeklyDustData})
	})

	API.call('/api/awslive', {
		address: window.armyWeather.private.address.main.key
	}, (AWSLiveData)=>{

		LocalWeatherDataLoader({AWSLiveData})
	})

	API.call('/api/warning', {}, (liveWarningData)=>{

		LocalWeatherDataLoader({liveWarningData})
	})
}

export function LocalWeatherInit (){
	if(isInited === true) return
	isInited = true

	// 현재 위치의 지역정보 & 날씨정보를 불러옵니다.
	LocalWeatherUpdate()

	document.getElementById('weather-type-currently').addEventListener('click', (event)=>{
		currentSliderSelected = 1
		LocalWeatherRedraw()
	})
	document.getElementById('weather-type-weekly').addEventListener('click', (event)=>{
		currentSliderSelected = 2
		LocalWeatherRedraw()
	})
	document.getElementById('weather-type-korea').addEventListener('click', (event)=>{
		currentSliderSelected = 3
		LocalWeatherRedraw()
	})
	document.getElementById('weather-type-dust').addEventListener('click', (event)=>{
		currentSliderSelected = 4
		LocalWeatherRedraw()
	})

	let mapPreDataCount = 0
	import('./sidoline.js').then(paramModule => {
		paramModule.default()
		if(++mapPreDataCount ==2) LocalWeatherRedraw()
	})
	import('./sigungu_new.js').then(paramModule => {
		paramModule.default()
		if(++mapPreDataCount ==2) LocalWeatherRedraw()
	})
}