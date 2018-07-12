import API from '../../transmitter/api.js'
import {UpdateAddressBar} from '../life/address.js'
import {HeatCalculate} from '../popup/heat.js'
import moment from 'moment'

let weatherSlider = null
let infoSlider = null
let infoFrontSlider = null
let graphicSlider = null
let infoImgSlider = null
let subtitleSlider = null
let airSlider = null
let weatherDescriptionSlider = null

let sliderBox = document.getElementById(`local-weather-slider-box`)
let globalBox = document.getElementById(`global-info-slider-box`)
let subtitleBox = document.getElementById(`subtitle-address-box`)
let descriptionBox = document.getElementById(`day-weather-description`)

let isLoaded = false
let isInited = false
let descriptionOpened = false
let currentSliderSelected = 1

let registeredUpdateCallback = null

let enteritisIndexNum = null
let currentTempIndexNum = null
let oldTextTitle = null

let keyData = [
	'liveWeatherData',
	'weeklyWeatherData',
	'dailyWeatherData',
	'monthlyWeatherData',

	'liveDustMainData',
	'liveDustSubData',
	'dailyDustData',
	'dailyForestData',

	'weeklyDustData',
	'weeklyEnteritis',
	'weeklyHeatdata',
	'weeklyHeatindex',
	'weeklyUv',
	'weeklyDiscomfort',
	'weeklyAsthma',
	'weeklyStroke',

	'liveWarningData',
	'AWSLiveData',
	'CITYLiveData',
	'SubtitleData',
	'localAreaData',
]

let needToLoadCount = keyData.length

// 자이로예제 http://inkfood.github.io/Gyro_demo/
export function weatherTextParse(paramWeatherGrade, paramCloudGrade, isLightning = false, isRainingOverride = false){
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
	return weatherStatus
}
export function weatherBackgroundParse(paramWeatherGrade, paramCloudGrade, isLightning = false, isRainingOverride = false){
	//paramCloudGrade
	//맑음(1), 구름조금(2), 구름많음(3), 흐림(4)

	//if(paramWeatherGrade == 0) return '없음'
	//if(paramWeatherGrade == 1) return '비 내림'
	//if(paramWeatherGrade == 2) return '눈비'
	//if(paramWeatherGrade == 3) return '눈 내림'

	let isNight = moment().get('hours')
	isNight = isNight >= 19 || isNight <= 6

	let weatherStatus = '맑음'
	let currentDay = moment().get('hours')

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

	let iconId = 'clean'
	if(weatherStatus.indexOf('맑음') !== -1){
		iconId = 'clean'
	}else if(weatherStatus.indexOf('구름조금') !== -1){
		iconId = 'cloud'
	}else if(weatherStatus.indexOf('구름많음') !== -1){
		iconId = 'cloud'
	}else if(weatherStatus.indexOf('구름많고비') !== -1){
		iconId = 'rain'
	}else if(weatherStatus.indexOf('구름많고눈') !== -1){
		iconId = 'snow'
	}else if(weatherStatus.indexOf('흐림') !== -1){
		iconId = 'foggy'
	}else if(weatherStatus.indexOf('흐리고비') !== -1){
		iconId = 'rain'
	}else if(weatherStatus.indexOf('흐리고눈') !== -1){
		iconId = 'snow'
	}else if(weatherStatus.indexOf('눈') !== -1){
		iconId = 'snow'
	}else if(weatherStatus.indexOf('비') !== -1){
		iconId = 'rain'
	}

	if(isRainingOverride) iconId = 1

	// 번개치면 무조건 배경 변경
	if(isLightning) iconId = 'thunder'

	if(isNight){
		switch(iconId){
		   case 'rain':
		   case 'clean':
		   case 'cloud':
		   case 'foggy':
				iconId += '_night'
		   break
		}
	}
	return `url(../resources/background/${iconId}.jpg`
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
	if(paramGrade == 4) return '최악'
	return '-'
}

export function ozonColorParseUsingTextFront(paramGrade){
	if(paramGrade == '좋음') return '#52c9de'
	if(paramGrade == '보통') return '#22ad73'
	if(paramGrade == '나쁨') return '#ff6c00'
	if(paramGrade == '최악') return '#ff6c00'
	return '#e78d18'
}

export function ozonColorParseUsingText(paramGrade){
	if(paramGrade == '좋음') return '#edf15a'
	if(paramGrade == '보통') return '#93f15a'
	if(paramGrade == '나쁨') return '#ff6c00'
	if(paramGrade == '최악') return 'tomato'
	return '#e78d18'
}

export function ozonColorParse(paramGrade){
	if(paramGrade == 1) return '#e78d18'
	if(paramGrade == 2) return '#e78d18'
	if(paramGrade == 3) return '#ff6c00'
	if(paramGrade == 4) return 'tomato'
	return '#e78d18'
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
	if(55 <= paramGrade && paramGrade < 71) return '#e78d18'
	if(71 <= paramGrade && paramGrade < 86) return '#ff6c00'
	if(86 <= paramGrade) return 'tomato'
	return '#e78d18'
}

export function discomfortColorParse(paramGrade){
	if(paramGrade < 68) return '#fff'
	if(68 <= paramGrade && paramGrade < 75) return '#e78d18'
	if(75 <= paramGrade && paramGrade < 80) return '#ff6c00'
	if(80 <= paramGrade) return 'tomato'
	return '#fff'
}
export function heatIndexColorParse(paramGrade){
	if(paramGrade < 32) return '#fff'
	if(32 <= paramGrade && paramGrade < 41) return '#e78d18'
	if(41 <= paramGrade && paramGrade < 54) return '#ff6c00'
	if(66 <= paramGrade) return 'tomato'
	return '#fff'
}

export function uvColorParse(paramGrade){
	if(paramGrade <= 5) return '#e78d18'
	if(6 <= paramGrade && paramGrade <= 7) return '#ff6c00'
	if(8 <= paramGrade && paramGrade <= 10) return 'tomato'
	if(11 <= paramGrade) return 'tomato'
	return '#fff'
}

export function generalColorParse(paramGrade, isFront = false){
	if(paramGrade == '낮음') return isFront ? '#e78d18' :  '#fff'
	if(paramGrade == '보통') return '#e78d18'
	if(paramGrade == '높음') return '#ff6c00'
	if(paramGrade == '위험') return 'tomato'
	return '#fff'
}

export function tempIndexColor(paramTemp){
	if(Number(paramTemp) >= 29) return `style="color: tomato;text-shadow: 1px 1px #000;font-size: 16px;"`
	else if(Number(paramTemp) >= 26) return `style="color: #e78d18;text-shadow: 1px 1px #000;font-size: 16px;"`
	return 'style="font-size: 16px;"'
}

export function dustIndexColor(paramDust){
	if(paramDust == '좋음') return 'style="color: #69fbf5;"'
	else if(paramDust == '보통') return 'style="color: #e2ffc3;"'
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
	if(paramRainAmount >= 15) return `style="color: tomato;"`
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

export function weatherParse(paramWeatherGrade, paramCloudGrade, isLightning = false, isRainingOverride = false){
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
		iconId = 1
	}else if(weatherStatus.indexOf('흐리고눈') !== -1){
		iconId = (isNight) ? 20 : 6
	}else if(weatherStatus.indexOf('눈') !== -1){
		iconId = (isNight) ? 20 : 6
	}else if(weatherStatus.indexOf('비') !== -1){
		iconId = 1
	}

	if(isRainingOverride) iconId = 1

	// 번개치면 상황별로 아이콘 변경
	if(isLightning){
		if(iconId == 1 || iconId == 3) iconId = 2
		if(iconId == 22) iconId = 23
		if(iconId == 10 || iconId == 13) iconId = 18
		if(iconId == 16) iconId = 17
	}

	return `resources/icons/pack-1/${iconId}.png`
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

export function dustGradeReverse(paramGrade){
	if(paramGrade == `좋음`) return 4
	if(paramGrade == `보통`) return 3
	if(paramGrade == `나쁨`) return 2
	if(paramGrade == `최악`) return 1
	return 5
}

export function getWeatherIcon(hour, paramWeatherStatus, isLightning = false, isRainingOverride = false){
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
		iconId = 1
	}else if(weatherStatus.indexOf('흐리고눈') !== -1){
		iconId = (isAM) ? 20 : 6
	}else if(weatherStatus.indexOf('눈') !== -1){
		iconId = (isAM) ? 20 : 6
	}else if(weatherStatus.indexOf('비') !== -1){
		iconId = 1
	}

	if(isRainingOverride) iconId = 1

	// 번개치면 상황별로 아이콘 변경
	if(isLightning){
		if(iconId == 1 || iconId == 3) iconId = 2
		if(iconId == 22) iconId = 23
		if(iconId == 10 || iconId == 13) iconId = 18
		if(iconId == 16) iconId = 17
	}
	return `resources/icons/pack-1/${iconId}.png`
}

export function uvGradeParse(paramGrade){
	if(paramGrade <= 2) return '낮음'
	if(3 <= paramGrade && paramGrade <= 5) return '보통'
	if(6 <= paramGrade && paramGrade <= 7) return '높음'
	if(8 <= paramGrade && paramGrade <= 10) return '경고'
	if(11 <= paramGrade) return '위험'
	return '-'
}

export function discomfortGradeParse(paramGrade){
	if(paramGrade < 68) return '낮음'
	if(68 <= paramGrade && paramGrade < 75) return '보통'
	if(75 <= paramGrade && paramGrade < 80) return '높음'
	if(80 <= paramGrade) return '경고'
	return '-'
}

export function WEBGLSupportCheck(){
	try {
		let canvas = document.createElement('canvas'); 
		return !!window.WebGLRenderingContext &&
		(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
	} catch(e) {
		return false
	}
}

export function LocalWeatherRedraw(){
	let liveWarningData = window.armyWeather.private.liveWarningData
	let liveWeatherData = window.armyWeather.private.liveWeatherData
	let dailyWeatherData = window.armyWeather.private.dailyWeatherData
	let weeklyWeatherData = window.armyWeather.private.weeklyWeatherData
	let monthlyWeatherData = window.armyWeather.private.monthlyWeatherData

	let liveDustMainData = window.armyWeather.private.liveDustMainData
	let liveDustSubData = window.armyWeather.private.liveDustSubData
	let dailyDustData = window.armyWeather.private.dailyDustData
	
	let weeklyEnteritis = window.armyWeather.private.weeklyEnteritis
	let weeklyHeatdata = window.armyWeather.private.weeklyHeatdata
	let weeklyDustData = window.armyWeather.private.weeklyDustData
	let weeklyHeatindex = window.armyWeather.private.weeklyHeatindex
	let weeklyAsthma = window.armyWeather.private.weeklyAsthma
	let weeklyDiscomfort = window.armyWeather.private.weeklyDiscomfort
	let weeklyStroke = window.armyWeather.private.weeklyStroke
	let weeklyUv = window.armyWeather.private.weeklyUv

	let AWSLiveData = window.armyWeather.private.AWSLiveData
	
	let temp = '-'
	let weather = '-'
	let amount = '0.0mm'
	let windDirection = '-'
	let lightning = '없음'
	let windSpeed = '-'

	// 상황별 자막 출력
	let descriptionHTML = '<div class=swiper-wrapper>'
	let descriptionAdder = (subtitleTexts)=>{
		descriptionHTML += `<div class="swiper-slide"><div class="day-weather-context"><a id=day-weather-description1 class=day-weather-temp-info>${subtitleTexts}</a></div></div>`
	}
	
	try{
		if(liveWeatherData !== null && liveWeatherData !== undefined){
			// 현재온도
			temp = liveWeatherData.data.temp.obsrValue +'℃'

			// 낙뢰상황
			lightning = (liveWeatherData.data.lightning.obsrValue == 1) ? '있음' : '없음'

			// 기상상태
			weather = weatherParse(liveWeatherData.data.weather.obsrValue, liveWeatherData.data.cloud.obsrValue, liveWeatherData.data.lightning.obsrValue)

			// 풍향 풍속
			windDirection = windDirectionParse(Number(liveWeatherData.data.windDirection.obsrValue))
			windSpeed = liveWeatherData.data.windSpeed.obsrValue + 'm/s'

			//document.getElementById(`heat-question-rtemp2-input`).value = Number(liveWeatherData.data.windSpeed.obsrValue)
			document.getElementById(`heat-question-rtemp2-input`).value = ''

			// 강우량
			amount = liveWeatherData.data.rainAmountAfter1Hour.obsrValue + 'mm'

			/*
			구름조금
			낙뢰있음
			통합대기 좋음
			00:00 시부 발표
			*/

			descriptionAdder(weatherTextParse(liveWeatherData.data.weather.obsrValue, liveWeatherData.data.cloud.obsrValue, liveWeatherData.data.lightning.obsrValue))
			descriptionAdder((liveWeatherData.data.lightning.obsrValue == 1) ? '낙뢰있음' : '낙뢰없음')
			descriptionAdder(moment(window.armyWeather.private.liveWeatherData.timestamp).utcOffset('+0900').format('HH:00 시부 발표'))
			// descriptionAdder(`온도ㆍ강수량은 매분 발표중`)

			let bgImgInner = document.getElementById(`bgimg-inner`)
			let bgImgSrc = weatherBackgroundParse(liveWeatherData.data.weather.obsrValue, liveWeatherData.data.cloud.obsrValue, liveWeatherData.data.lightning.obsrValue)
			bgImgInner.style.background = bgImgSrc

			// 비오는 이미지일때만 블러적용
			let bgImgBlur = document.getElementById(`overlay-bgimg`)
			
			// rain_night
			if(bgImgSrc.indexOf(`rain_night.jpg`) !== -1
				|| bgImgSrc.indexOf(`cloud_night.jpg`) !== -1){
				bgImgBlur.style.opacity = 1
			}else if(bgImgSrc.indexOf(`clean_night.jpg`) !== -1){
				bgImgBlur.style.opacity = 0.7
			}else{
				bgImgBlur.style.opacity = 0
			}

			bgImgInner.style['background-size'] = 'cover'
			bgImgInner.style['background-repeat'] = 'round'
		}
	}catch(e){
		//console.log(e)
	}

	let currentHour = moment().get('hour')
	let itemHour = getItemHour(currentHour)

	document.getElementById('day-weather-info2').innerHTML = temp
	document.getElementById('day-weather-temp-info2').innerHTML = `${windDirection}(${windSpeed})`
	//document.getElementById('day-weather-rain-info4').innerHTML = amount

	if(weather != '-') document.getElementById('day-weather-status-img').src = weather

	
	// 3가지 정보를 보고별로 출력
	// 더위지수 온도지수 체감온도
	let isRealTempReported = false
	
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
	
	try{
		if(window.armyWeather.private.localAreaData.data.data !== undefined){
			let currentMonth = Number(moment().format('M'))

			// 온도지수는 5~9월달
			// 체감지수는 10~4월달
			if(currentMonth >= 5 && currentMonth <= 9){
				// 온도지수 표시
				if(window.armyWeather.private.localAreaData.data.data.tempIndex !== null){
					// 데이터가 존재하고 숫자일 때

					let isLastTimeCurrent = false
					let reportedTimeHour = Number(moment(window.armyWeather.private.localAreaData.data.data.reportedTime).format('H'))
					let currentDiffTimeHour = Number(moment().format('H'))
					let lastTimeDiff = Math.abs(reportedTimeHour - currentDiffTimeHour)

					isLastTimeCurrent = (lastTimeDiff <= 2)

					if(isLastTimeCurrent){
						document.getElementById(`day-weather-info4`).innerText = `온도지수:`
						document.getElementById('day-weather-info5').innerHTML = window.armyWeather.private.localAreaData.data.data.tempIndex
						document.getElementById('day-weather-info6').innerHTML = `(${reportedTimeHour}시 기준)`
						isRealTempReported = true
					}
				}
			}else{
				// 온도지수 표시
				if(window.armyWeather.private.localAreaData.data.data.realTemp !== null){
					// 데이터가 존재하고 숫자일 때

					let isLastTimeCurrent = false
					let reportedTimeHour = Number(moment(window.armyWeather.private.localAreaData.data.data.reportedTime).format('H'))
					let currentDiffTimeHour = Number(moment().format('H'))
					let lastTimeDiff = Math.abs(reportedTimeHour - currentDiffTimeHour)

					isLastTimeCurrent = (lastTimeDiff <= 2)

					if(isLastTimeCurrent){
						document.getElementById(`day-weather-info4`).innerText = `체감온도:`
						document.getElementById('day-weather-info5').innerHTML = window.armyWeather.private.localAreaData.data.data.realTemp
						document.getElementById('day-weather-info6').innerHTML = `(${reportedTimeHour}시 기준)`
						isRealTempReported = true
					}
				}
			}
		}
	}catch(e){}
	
	if(!isRealTempReported){
		document.getElementById(`day-weather-info4`).innerText = `더위지수:`
		document.getElementById('day-weather-info5').innerHTML = currentTempIndex
		document.getElementById('day-weather-info6').innerHTML = `(${currentTempIndexHour}시 기준)`
	}

	

	
	
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
		if(liveDustMainData !== null && liveDustMainData !== undefined){
			ozon = liveDustMainData[0].o3Value
			ozonGrade = `${ozonGradeParse(liveDustMainData[0].o3Grade)}`
			ozonColor = ozonColorParse(liveDustMainData[0].o3Grade)
			
			// 오존 정보가 아예 없으면
			// 보조 관측소 정보를 적용
			if(ozon == '-'){
				ozon = liveDustSubData[0].o3Value
				ozonGrade = `${ozonGradeParse(liveDustSubData[0].o3Grade)}`
				ozonColor = ozonColorParse(liveDustSubData[0].o3Grade)
			}

			// pm10의 낮정보가 없으면 밤정보 적용
			if(liveDustMainData[0]['pm10Value'] != '-'){
				pm10 = liveDustMainData[0].pm10Value
				if(liveDustMainData[0]['pm25Value'] !== 'undefined')
					pm25 = liveDustMainData[0].pm25Value
				pm10Grade = `${ozonGradeParse(liveDustMainData[0].pm10Grade1h)}`
				if(liveDustMainData[0]['pm25Grade1h'] !== 'undefined')
					pm25Grade = `${ozonGradeParse(liveDustMainData[0].pm25Grade1h)}`
				pm10Color = ozonColorParse(liveDustMainData[0].pm10Grade1h)
				pm25Color = ozonColorParse(liveDustMainData[0].pm25Grade1h)
			}else{
				pm10 = liveDustMainData[0].pm10Value24
				if(liveDustMainData[0]['pm25Value24'] !== 'undefined')
					pm25 = liveDustMainData[0].pm25Value24
				pm10Grade = `${ozonGradeParse(liveDustMainData[0].pm10Grade)}`
				if(liveDustMainData[0]['pm25Grade'] !== 'undefined')
					pm25Grade = `${ozonGradeParse(liveDustMainData[0].pm25Grade)}`
				pm10Color = ozonColorParse(liveDustMainData[0].pm10Grade)
				pm25Color = ozonColorParse(liveDustMainData[0].pm25Grade)
			}

			// pm10 정보가 아예 없으면
			// 보조 관측소 정보를 적용
			if(pm10 == '-'){
				if(liveDustSubData[0]['pm10Value'] != '-'){
					if(liveDustSubData[0]['pm10Value'] !== 'undefined')
						pm10 = liveDustSubData[0].pm10Value
					if(liveDustSubData[0]['pm10Grade1h'] !== 'undefined')
						pm10Grade = `${ozonGradeParse(liveDustSubData[0].pm10Grade1h)}`
					pm25Color = ozonColorParse(liveDustSubData[0].pm10Grade1h)
				}else{
					if(liveDustSubData[0]['pm10Value24'] !== 'undefined')
						pm10 = liveDustSubData[0].pm10Value24
					if(liveDustSubData[0]['pm10Grade'] !== 'undefined')
						pm10Grade = `${ozonGradeParse(liveDustSubData[0].pm10Grade)}`
					pm25Color = ozonColorParse(liveDustSubData[0].pm10Grade)
				}
			}

			// pm25 정보가 아예 없으면
			// 보조 관측소 정보를 적용
			if(pm25 == '-'){
				if(liveDustSubData[0]['pm25Value'] != '-'){
					if(liveDustSubData[0]['pm25Value'] !== 'undefined')
						pm25 = liveDustSubData[0].pm25Value
					if(liveDustSubData[0]['pm25Grade1h'] !== 'undefined')
						pm25Grade = `${ozonGradeParse(liveDustSubData[0].pm25Grade1h)}`
					pm25Color = ozonColorParse(liveDustSubData[0].pm25Grade1h)
				}else{
					if(liveDustSubData[0]['pm25Value24'] !== 'undefined')
						pm25 = liveDustSubData[0].pm25Value24
					if(liveDustSubData[0]['pm25Grade'] !== 'undefined')
						pm25Grade = `${ozonGradeParse(liveDustSubData[0].pm25Grade)}`
					pm25Color = ozonColorParse(liveDustSubData[0].pm25Grade)
				}
			}
		}
	}catch(e){}

	if(pm10Grade == '매우나쁨') pm10Grade = '최악'
	if(pm25Grade == '매우나쁨') pm25Grade = '최악'

	let intergratedAirGrade = ''
	let tempA = dustGradeReverse(pm10Grade)
	let tempB = dustGradeReverse(pm25Grade)
	intergratedAirGrade = (tempA < tempB) ? tempA : tempB
	if(intergratedAirGrade == 5) intergratedAirGrade =  '-'
	if(intergratedAirGrade == 4) intergratedAirGrade = '좋음'
	if(intergratedAirGrade == 3) intergratedAirGrade = '보통'
	if(intergratedAirGrade == 2) intergratedAirGrade = '나쁨'
	if(intergratedAirGrade == 1) intergratedAirGrade = '매우나쁨'
	descriptionAdder(`대기수준: ${intergratedAirGrade}`)

	document.getElementById(`local-air-grade-grpah`).children[0].innerText = intergratedAirGrade
	document.getElementById(`local-air-grade-grpah`).style.background = ozonColorParseUsingTextFront(intergratedAirGrade)

	document.getElementById('day-air-info1').innerHTML = ozon
	if(ozonGrade == '(-)') ozonGrade = '-'
	document.getElementById('day-air-info2').innerHTML = `(${ozonGrade})`
	document.getElementById('day-air-info1').style.color = ozonColor
	document.getElementById('day-air-info2').style.color = ozonColor

	document.getElementById('day-weather-wind-info2').innerHTML = pm10
	if(pm10Grade == '(-)') pm10Grade = '-'
	document.getElementById('day-weather-wind-info3').innerHTML = `(${pm10Grade})`
	document.getElementById('day-weather-wind-info2').style.color = pm10Color
	document.getElementById('day-weather-wind-info3').style.color = pm10Color

	document.getElementById('day-weather-wind-info5').innerHTML = pm25
	if(pm25Grade == '(-)') pm25Grade = '-'
	document.getElementById('day-weather-wind-info6').innerHTML = `(${pm25Grade})`
	document.getElementById('day-weather-wind-info5').style.color = pm25Color
	document.getElementById('day-weather-wind-info6').style.color = pm25Color

	// 생활날씨 정보 반영
	let frontPM10Color = ozonColorParseUsingText(pm10Grade)
	let frontPM10ValueElem = document.getElementById(`front-pm10-value`)
	let frontPM10GradeElem = document.getElementById(`front-pm10-grade`)
	frontPM10ValueElem.innerText = pm10
	if(pm10Grade == '(-)') pm10Grade = '-'
	frontPM10GradeElem.innerText = `[${pm10Grade}]`
	frontPM10GradeElem.style.color = frontPM10Color

	// 생활날씨 정보 반영
	let frontPM2_5Color = ozonColorParseUsingText(pm25Grade)
	let frontPM2_5ValueElem = document.getElementById(`front-pm2_5-value`)
	let frontPM2_5GradeElem = document.getElementById(`front-pm2_5-grade`)
	if(pm25Grade == '(-)') pm25Grade = '-'
	frontPM2_5ValueElem.innerText = pm25
	frontPM2_5GradeElem.innerText = `[${pm25Grade}]`
	frontPM2_5GradeElem.style.color = frontPM2_5Color

	document.getElementById(`local-weather-box-outline`).style.background = `rgba(1, 1, 1, 0.42)`

	if(infoSlider != null)
		infoSlider.destroy()

	let infoFrontBox = document.getElementById(`local-front-info-slider-box`)
	if(infoFrontSlider != null)
		infoFrontSlider.destroy()
	infoFrontBox.innerHTML = ``

	if(weatherSlider != null)
		weatherSlider.destroy()
	sliderBox.innerHTML = ``
	sliderBox.style.zIndex = "1"

	if(graphicSlider != null)
		graphicSlider.destroy()
	if(infoImgSlider != null)
		infoImgSlider.destroy()
	globalBox.innerHTML = ``
	

	let weatherBoxType = document.getElementById('local-weather-box-type')
	weatherBoxType.innerHTML = ''

	let weatherBoxOutline = document.getElementById(`local-weather-box-outline`)
	weatherBoxOutline.style.top = `200px`
	weatherBoxOutline.style.height = `356px`

	document.getElementById(`day-weather-outline`).style.opacity = '1'
	document.getElementById(`local-weather-box-type`).style.zIndex = 1

	//현재 예보 슬라이더
	if(currentSliderSelected == 1){
		try{
			if(dailyWeatherData !== null && dailyWeatherData !== undefined){
				document.getElementById('day-top-weather-box').style.opacity = '1'
				document.getElementById(`day-weather-outline`).style.zIndex = '-1'
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
				<a class="local-weather-context-sub-bold" style="top: 4px;">날씨</a><br>
				<a class="local-weather-context-sub-bold local-weather-context-temp-2" style="font-size: 17px;top: 11px;">온도</a><br>
				<a class="local-weather-context-sub-bold local-weather-context-temp">더위지수</a><br>
				<a class="local-weather-context-sub-bold">강수확률</a><br>
				<a class="local-weather-context-sub-bold">강수량</a><br>
				<a class="local-weather-context-sub-bold">풍속</a><br>
				<a class="local-weather-context-sub-bold">풍향</a><br>
				<a class="local-weather-context-sub-bold">습도</a><br>`

				weatherBoxType.insertAdjacentHTML('beforeend', weatherBoxTypeHTML)

				for(let dailyData of dailyWeatherData.forecast.daily){
					let currentAddDate = '-'
					let currentAddedDateCount = Number(dailyData.day)

					let targetHour = getDayHour(currentAddedDateCount, Number(dailyData.hour))
					let ondoJisu = (weeklyHeatdata.length == 0) ? '-' : weeklyHeatdata[targetHour]
					if(ondoJisu == null) ondoJisu = `-`

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
						el: '.swiper-scrollbar'
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
				<a class="local-weather-context-sub local-weather-context-temp" style="font-size: 16px;">최고온도</a><br>
				<a class="local-weather-context-sub local-weather-context-temp" style="font-size: 16px;">최저온도</a><br>
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
						//currentWeekDay = ''
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
					weatherHTML += `<a class="local-weather-context-sub local-weather-context-temp" style="font-size: 16px;">${tempMin}℃</a><br>`
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
					let currentDay = `${Number(currentTimeParse[0].split('-')[1])}/${Number(currentTimeParse[0].split('-')[2])}`
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
					weatherHTML += `<a class="local-weather-context-sub local-weather-context-temp" style="font-size: 16px;">${weeklyData.tmn[0]}℃</a><br>`
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
						el: '.swiper-scrollbar'
					}
				})

				let infoHTML = `
				<div class="swiper-wrapper">
				<div class="swiper-slide local-info-text">`
				
				+`<br/>
				<h4>[${liveWarningData.reports.news.title}]</h4><br/>
				${liveWarningData.reports.news.context.split('<br /><br />').join('<br/><br/>').split('<br />').join('').split(`( 기상 현황과 전망 )`).join(``)}`
				// <h2>[실시간 기상전망]</h2>
				infoHTML += `<br/><br/>${weeklyWeatherData.localData.description.split('<br /><br />').join('<br/><br/>').split('<br />').join('')}`
				/*
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
				*/
				infoHTML += `</div><div class="swiper-scrollbar"></div>`
				infoFrontBox.insertAdjacentHTML('beforeend', infoHTML)
				document.getElementById(`day-weather-outline`).style.zIndex = 1

				infoFrontSlider = new Swiper('.local-front-info', {
					direction: 'vertical',
					slidesPerView: 'auto',
					freeMode: true,
					scrollbar: {
						el: '.swiper-scrollbar'
					},
					mousewheel: true,
				})
			}
		}catch(e){
			//console.log(e)
		}
	}else if(currentSliderSelected == 3){
		document.getElementById(`local-weather-box-type`).style.zIndex = 0
		try{
			weatherBoxOutline.style.top = `-12px`
			weatherBoxOutline.style.height = `565px`

			if(monthlyWeatherData !== null && monthlyWeatherData !== undefined){
				document.getElementById('day-top-weather-box').style.opacity = '0'

				let dustDescription2dayAfter = (window.armyWeather.private.dailyDustData.data[2].reason).split('[미세먼지]').join('')
				dustDescription2dayAfter = dustDescription2dayAfter.length == 0 ? '' : `(${dustDescription2dayAfter})`

				// 그래픽 슬라이더 구현
				document.getElementById(`day-weather-outline`).style.opacity = '0'
				weatherBoxOutline.style.background = `#fff`

				let getGlobalTemp = (areaName) =>{
					try{
						if(typeof AWSLiveData.global[areaName] == 'undefined')
							return '-℃'
						return `${AWSLiveData.global[areaName].data.temp}℃`
					}catch(e){
						//console.log(e)
						return '-℃'
					}
				}
				let getGlobalIcon = (areaName) =>{
					if(typeof AWSLiveData.global[areaName] == 'undefined')
							return 'resources/icons/pack-1/15.png'

					try{
						let globalAreaInnerData = AWSLiveData.global[areaName].live.data
						return weatherParse(globalAreaInnerData.weather.obsrValue, globalAreaInnerData.cloud.obsrValue, globalAreaInnerData.lightning.obsrValue)
					}catch(e){
						//console.log(e)
						return 'resources/icons/pack-1/15.png'
					}
				}

				let globalHTML = '<div class=swiper-wrapper>'

				// 현재 전국날씨 슬라이드 구현
				+ `<div class="swiper-slide">`
				+ `<img id=global-weather-img1 data-src="/resources/images/map.png" class="global-weather-img swiper-lazy"></img>`
				+ `<div id="global-weather-title" style="color: #516d77;"><p>현재 전국날씨</p></div>`

				// 인천
				+ `<div class="global-weather-box" style="top: 81px;left: 77px;">
						<div class="global-weather-item1">인천</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`인천`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`인천`)}</div>
					</div>`
				// 서울
				+ `<div class="global-weather-box" style="top: 64px;left: 134px;">
						<div class="global-weather-item1">서울</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`서울`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`서울`)}</div>
					</div>`
				// 포천
				+ `<div class="global-weather-box" style="top: 57px;left: 188px;">
						<div class="global-weather-item1">포천</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`포천`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`포천`)}</div>
					</div>`

				// 춘천
				+ `<div class="global-weather-box" style="top: 25px;left: 241px;">
						<div class="global-weather-item1">춘천</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`춘천`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`춘천`)}</div>
					</div>`
				
				// 수원
				+ `<div class="global-weather-box" style="top: 152px;left: 143px;">
						<div class="global-weather-item1">수원</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`수원`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`수원`)}</div>
					</div>`

				// 강릉
				+ `<div class="global-weather-box" style="top: 63px;left: 291px;">
						<div class="global-weather-item1">강릉</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`강릉`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`강릉`)}</div>
					</div>`

				// 광주
				+ `<div class="global-weather-box" style="top: 457px;left: 126px;">
						<div class="global-weather-item1">광주</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`광주`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`광주`)}</div>
					</div>`

				// 대구
				+ `<div class="global-weather-box" style="top: 296px;left: 293px;">
						<div class="global-weather-item1">대구</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`대구`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`대구`)}</div>
					</div>`

				// 대전
				+ `<div class="global-weather-box" style="top: 232px;left: 202px;">
						<div class="global-weather-item1">대전</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`대전`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`대전`)}</div>
					</div>`
				// 목포
				+ `<div class="global-weather-box" style="top: 366px;left: 75px;">
						<div class="global-weather-item1">목포</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`목포`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`목포`)}</div>
					</div>`
				// 부산
				+ `<div class="global-weather-box" style="top: 395px;left: 296px;">
						<div class="global-weather-item1">부산</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`부산`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`부산`)}</div>
					</div>`
				// 세종
				+ `<div class="global-weather-box" style="top: 247px;left: 130PX;">
						<div class="global-weather-item1">세종</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`세종`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`세종`)}</div>
					</div>`
				// 여수
				+ `<div class="global-weather-box" style="top: 423px;left: 208px;">
						<div class="global-weather-item1">여수</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`여수`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`여수`)}</div>
					</div>`
				// 울산
				+ `<div class="global-weather-box" style="top: 319px;left: 374px;">
						<div class="global-weather-item1">울산</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`울산`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`울산`)}</div>
					</div>`
				// 원주
				+ `<div class="global-weather-box" style="top: 131px;left: 233px;">
						<div class="global-weather-item1">원주</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`원주`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`원주`)}</div>
					</div>`
				// 전주
				+ `<div class="global-weather-box" style="top: 328px;left: 185px;">
						<div class="global-weather-item1">전주</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`전주`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`전주`)}</div>
					</div>`
				// 충주
				+ `<div class="global-weather-box" style="top: 213px;left: 268px;">
						<div class="global-weather-item1">충주</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`충주`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`충주`)}</div>
					</div>`
				// 제주
				+ `<div class="global-weather-box" style="top: 489px;left: 3px;">
						<div class="global-weather-item1">제주</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`제주`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`제주`)}</div>
					</div>`
				// 울릉
				+ `<div class="global-weather-box" style="top: 90px;left: 342px;">
						<div class="global-weather-item1">울릉</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`울릉`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`울릉`)}</div>
					</div>`
				// 독도
				+ `<div class="global-weather-box" style="top: 97px;left: 390px;">
						<div class="global-weather-item1">독도</div>
						<div class="global-weather-item2">
							<img class="local-weather-context-img swiper-lazy" data-src="${getGlobalIcon(`독도`)}" style="height: 30PX;width:  30PX;">
						</div>
						<div class="global-weather-item3">${getGlobalTemp(`독도`)}</div>
					</div>`

				// 슬라이드 끝
				+ `</div>`

				// 전국 예보 글 슬라이드 구현
				globalHTML += `<div class="swiper-slide">`
				+ `<div id=local-info-slider-box class="swiper-container local-info"></div>`
				+ `</div>`

				// 크로스헤어 구현 (TODO)
				// degree -> px 변환
				/*
				let xPx = 0
				let yPx = 0
				if(typeof window.armyWeather.private.address.main['lat'] !== undefined){
					xPx = 325 * (( Number(window.armyWeather.private.address.main.lat) -33.343538) / 9.598978)
					yPx = (515 * ((( Number(window.armyWeather.private.address.main.long) -124.265333) / 6.999422)))
				}
				+ `<img src="/resources/icons/crosshair.png" class="global-weather-crosshair" style="top: ${yPx}px;left: ${xPx}px;">`
				console.log(xPx, yPx)
				*/

				// 기상청 공항기상
				globalHTML += `<div class="swiper-slide">`
				+ `
<div style="
    width: 171px;
    height: 102px;
    position: absolute;
    top: 170px;
    z-index: 5;
"></div>
<div style="
    width: 440px;
    height: 400px;
    position: absolute;
    top: 249px;
    z-index: 5;
"></div>
<div style="
    position:  relative;
    left: -37px;
    top: -155px;
    width: 570px;
    height: 401px;
    overflow: hidden;
    z-index: 3;
"><iframe id="ifrm" name="ifrm" src="http://amo.kma.go.kr/new/html/weather/weather01_01.jsp" style="width: 545px;height: 689px;position:  relative;top: -232px;left: -173px;z-index: 2;transform: scale(1.27, 1);" frameborder="0" framespacing="0" marginheight="0" marginwidth="0" scrolling="no" vspace="0"></iframe></div>
<div style="
    position:  relative;
    left: 15px;
    top: -222px;
    width: 475px;
    height: 701px;
    overflow: hidden;
"><iframe id="ifrm" name="ifrm" src="http://amo.kma.go.kr/new/html/weather/weather01_01.jsp" style="width: 1145px;height: 889px;position:  relative;top: -290px;left: -633px;z-index: 2;transform: scale(0.97, 0.8);" frameborder="0" framespacing="0" marginheight="0" marginwidth="0" scrolling="no" vspace="0"></iframe></div></div>`

				let lat = window.armyWeather.private.address.main.lat
				let long = window.armyWeather.private.address.main.long
				// 미세먼지 슬라이드 구현
				globalHTML += `<div class="swiper-slide">`
				+ `<img data-src="${window.armyWeather.private.apiPath}/resources/gif/dustgif_0.gif" class="global-weather-img-dust swiper-lazy"></img>`
				+ `<div id="global-weather-title" style="color: #3597fa;"><p>미세먼지예보</p></div>`
				+ `</div>`
				
				// 초미세먼지 슬라이드 구현
				globalHTML += `<div class="swiper-slide">`
				+ `<img data-src="${window.armyWeather.private.apiPath}/resources/gif/dustgif_1.gif" class="global-weather-img-dust swiper-lazy"></img>`
				+ `<div id=global-weather-title style="color: #3597fa;"><p>초미세먼지예보</p></div>`
				+ `</div>`

				// 오존 슬라이드 구현
				+ `<div class="swiper-slide">`
				+ `<img data-src="${window.armyWeather.private.apiPath}/resources/gif/dustgif_2.gif" class="global-weather-img-dust swiper-lazy"></img>`
				+ `<div id=global-weather-title style="color: #3597fa;"><p>오존예보</p></div>`
				+ `</div>`

				// 기상청 위성사진
				globalHTML += `<div class="swiper-slide">`
				+ `<div style="
    position:  relative;
    left: 0;
    width:  440px;
    height: 568px;
    overflow: hidden;
">
<div style="
    width: 440px;
    height: 514px;
    position: absolute;
    top: 55px;
    z-index: 5;
"></div>
<iframe id="ifrm" name="ifrm" src="http://www.weather.go.kr/weather/images/satellite_basic03.jsp" style="width: 736px;height: 1000px;position:  relative;top: -432px;left: -271px;z-index: 2;transform: scale(0.97, 1);" frameborder="0" framespacing="0" marginheight="0" marginwidth="0" scrolling="no" vspace="0"></iframe></div></div>`

				/*
				// 전국기온예보 슬라이드 구현
				globalHTML += `<div class="swiper-slide">`
				+ `<img id=global-weather-img2 data-src="/resources/gif/temp.gif" class="global-weather-img swiper-lazy"></img>`
				+ `<div id=global-weather-title><p>전국기온예보</p></div>`
				+ `<div id=global-weather-img3><img data-src="/resources/gif/temp.gif" class="global-weather-img swiper-lazy"></img></div>`
				+ `<div id=global-weather-img4><img data-src="/resources/gif/temp.gif" class="global-weather-img swiper-lazy"></img></div>`
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
				+ `<img id=global-weather-img2 data-src="/resources/gif/tempmax.gif" class="global-weather-img swiper-lazy"></img>`
				+ `<div id=global-weather-title-year><p>최고기온예보</p></div>`
				+ `<div id=global-weather-img3-year><img data-src="/resources/gif/tempmax.gif" class="global-weather-img swiper-lazy"></img></div>`
				+ `<div id=global-weather-img4><img data-src="/resources/gif/tempmax.gif" class="global-weather-img swiper-lazy"></img></div>`
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
				+ `<img id=global-weather-img2 data-src="/resources/gif/rainamount.gif" class="global-weather-img swiper-lazy"></img>`
				+ `<div id=global-weather-title-year><p>전국강수량예보</p></div>`
				+ `<div id=global-weather-img3-year><img data-src="/resources/gif/rainamount.gif" class="global-weather-img swiper-lazy"></img></div>`
				+ `<div id=global-weather-img4><img data-src="/resources/gif/rainamount.gif" class="global-weather-img swiper-lazy"></img></div>`
				+ `<div id="global-weather-count" style="
					line-height: 73px;
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
				+ `<img id=global-weather-img2 data-src="/resources/gif/rain.gif" class="global-weather-img swiper-lazy"></img>`
				+ `<div id=global-weather-title-year><p>강수확률예보</p></div>`
				+ `<div id=global-weather-img3-year><img data-src="/resources/gif/rain.gif" class="global-weather-img swiper-lazy"></img></div>`
				+ `<div id=global-weather-img4><img data-src="/resources/gif/rain.gif" class="global-weather-img swiper-lazy"></img></div>`
				+ `<div id="global-weather-count" style="
					line-height: 107px;
					top: -683px;
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
				+ `<img id=global-weather-img2 data-src="/resources/gif/sky.gif" class="global-weather-img swiper-lazy"></img>`
				+ `<div id="global-weather-title-year" style="color: #008eaa;"><p>하늘상태예보</p></div>`
				+ `<div id="global-weather-img3-year" style="filter: hue-rotate(-55deg);"><img data-src="/resources/gif/sky.gif" class="global-weather-img swiper-lazy"></div>`
				+ `<div id=global-weather-img4><img data-src="/resources/gif/sky.gif" class="global-weather-img swiper-lazy"></img></div>`
				+ `<div id="global-weather-count" style="
					line-height: 133px;
					top: -674px;
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
				+ `<img id=global-weather-img2 data-src="/resources/gif/wave.gif" class="global-weather-img swiper-lazy"></img>`
				+ `<div id="global-weather-title-year" style="color: #6b4300;"><p>전국파고예보</p></div>`
				+ `<div id="global-weather-img3-year" style="filter: hue-rotate(170deg);"><img data-src="/resources/gif/wave.gif" class="global-weather-img swiper-lazy"></div>`
				+ `<div id=global-weather-img4><img data-src="/resources/gif/wave.gif" class="global-weather-img swiper-lazy"></img></div>`
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
				+ `<img id=global-weather-img2 data-src="/resources/gif/humidity.gif" class="global-weather-img swiper-lazy"></img>`
				+ `<div id=global-weather-title-year><p>전국습도예보</p></div>`
				+ `<div id=global-weather-img3-year><img data-src="/resources/gif/humidity.gif" class="global-weather-img swiper-lazy"></img></div>`
				+ `<div id=global-weather-img4><img data-src="/resources/gif/humidity.gif" class="global-weather-img swiper-lazy"></img></div>`
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
				*/

				// WEB GL 지원 될 때만 구현적용
				if(WEBGLSupportCheck()){
					/*
					// 미세먼지 위성지도 슬라이드 구현
					globalHTML += `<div class="swiper-slide">`
					globalHTML += `<div id="global-weather-title" style="color: #516d77;"><p>미세먼지 레이더</p></div>`
					globalHTML += `<iframe id="ifrm2" name="ifrm2" src="https://earth.nullschool.net/#current/particulates/surface/level/overlay=pm2.5/orthographic=-233.73,36.00,1300/loc=${long},${lat}" style="width: 100%;height: 90%;position:  relative;top: 33px;z-index: -10;" frameborder="0" framespacing="0" marginheight="0" marginwidth="0" scrolling="no" vspace="0"></iframe>`
					globalHTML += `</div>`

					// 초미세먼지 위성지도 슬라이드 구현
					globalHTML += `<div class="swiper-slide">`
					globalHTML += `<div id="global-weather-title" style="color: #516d77;"><p>초미세먼지 레이더</p></div>`
					globalHTML += `<iframe id="ifrm2" name="ifrm2" src="https://earth.nullschool.net/#current/particulates/surface/level/overlay=pm10/orthographic=-233.73,36.00,1300/loc=${long},${lat}" style="width: 100%;height: 90%;position:  relative;top: 33px;z-index: -10;" frameborder="0" framespacing="0" marginheight="0" marginwidth="0" scrolling="no" vspace="0"></iframe>`
					globalHTML += `</div>`

					// 파고 위성지도 슬라이드 구현
					globalHTML += `<div class="swiper-slide">`
					globalHTML += `<div id="global-weather-title" style="color: #516d77;"><p>파고 레이더</p></div>`
					globalHTML += `<iframe id="ifrm2" name="ifrm2" src="https://earth.nullschool.net/#current/ocean/primary/waves/overlay=significant_wave_height/orthographic=-233.73,36.00,1300/loc=${long},${lat}" style="width: 100%;height: 90%;position:  relative;top: 33px;z-index: -10;" frameborder="0" framespacing="0" marginheight="0" marginwidth="0" scrolling="no" vspace="0"></iframe>`
					globalHTML += `</div>`

					// 바람 위성지도 슬라이드 구현
					globalHTML += `<div class="swiper-slide">`
					globalHTML += `<div id="global-weather-title" style="color: #516d77;"><p>바람 레이더</p></div>`
					globalHTML += `<iframe id="ifrm2" name="ifrm2" src="https://earth.nullschool.net/#current/wind/surface/level/orthographic=-233.73,36.00,1300/loc=${long},${lat}" style="width: 100%;height: 90%;position:  relative;top: 33px; z-index: -10;" frameborder="0" framespacing="0" marginheight="0" marginwidth="0" scrolling="no" vspace="0"></iframe>`
					globalHTML += `</div>`
					*/
				}

				if(WEBGLSupportCheck()){
					/*
					// meteoblue 위성지도 슬라이드 구현
					globalHTML += `<div class="swiper-slide">`
					globalHTML += `<div id="global-weather-title" style="color: #516d77;"><p>바람세기 레이더</p></div>`
					globalHTML += `<iframe id="ifrm" name="ifrm" src="https://www.meteoblue.com/en/weather/maps/index#36.485N130.254E_KST+09:00" style="width: 100%;height: 90%;position:  relative;top: 33px;" frameborder="0" framespacing="0" marginheight="0" marginwidth="0" scrolling="no" vspace="0"></iframe>`
					globalHTML += `</div>`
					*/
				}

				globalHTML += `</div>
					<div class="swiper-scrollbar"></div>
					<div class="swiper-button-prev swiper-button-white"></div>
					<div class="swiper-button-next swiper-button-white"></div>`
				globalBox.insertAdjacentHTML('beforeend', globalHTML)

				let isTouchMoved = 0
				graphicSlider = new Swiper('.global-info-slider', {
					lazy: true,
					slidesPerView: 'auto',
					centeredSlides: false,
					grabCursor: true,
					height: 356,
					autoHeight: false,
					scrollbar: {
						el: '.swiper-scrollbar'
					},
					navigation: {
						nextEl: '.swiper-button-next',
						prevEl: '.swiper-button-prev'
					},
					on: {
						slideChange: ()=>{
							if(graphicSlider.activeIndex != 1){
								document.getElementById(`day-weather-outline`).style.opacity = '1'
								weatherBoxOutline.style.background = `#fff`
							}else{
								document.getElementById(`day-weather-outline`).style.opacity = '0'
								weatherBoxOutline.style.background = `rgba(1, 1, 1, 0.42)`
							}
							/*
							let weatherBoxOutline = document.getElementById(`local-weather-box-outline`)
							let landsatControl = document.getElementById(`landset-control`)
							let iframe2 = document.getElementById(`ifrm2`)

							if(graphicSlider.activeIndex == 1){
								// 기상 레이더 활성화
								weatherBoxOutline.style.top = `-12px`
								weatherBoxOutline.style.height = `565px`

							}else if(graphicSlider.activeIndex == 2){
								// 렌드셋 활성화
								weatherBoxOutline.style.top = `-12px`
								weatherBoxOutline.style.height = `565px`
								landsatControl.style.height = `510px`
								iframe2.style.height = `105.4%`
							}else if(graphicSlider.activeIndex == 3
									 || graphicSlider.activeIndex == 4
									 || graphicSlider.activeIndex == 5){
								// 미세먼지 GIF 활성화
								weatherBoxOutline.style.top = `-12px`
								weatherBoxOutline.style.height = `565px`

							}else{
								// 렌드셋 비활성화
								weatherBoxOutline.style.top = `200px`
								weatherBoxOutline.style.height = `356px`
								landsatControl.style.height = `305px`
								iframe2.style.height = `127%`
							}
							*/
						}
					}
				})

				// 호출되면 미리 모든 페이지 불러오기
				graphicSlider.lazy.loadInSlide(0)
				graphicSlider.lazy.loadInSlide(1)
				graphicSlider.lazy.loadInSlide(2)
				graphicSlider.lazy.loadInSlide(3)
				graphicSlider.lazy.loadInSlide(4)
				graphicSlider.lazy.loadInSlide(5)
				graphicSlider.lazy.loadInSlide(6)
				/*
				graphicSlider.lazy.loadInSlide(7)
				graphicSlider.lazy.loadInSlide(8)
				graphicSlider.lazy.loadInSlide(9)
				graphicSlider.lazy.loadInSlide(10)
				graphicSlider.lazy.loadInSlide(11)
				*/

				let infoHTML = `
				<div class="swiper-wrapper">
				<div class="swiper-slide local-info-text">`
				+`<br/><h2>[지역별 전국예보]</h2>`
				+`<br/>${weeklyWeatherData.description.split('<br /><br />').join('<br/><br/>').split('<br />').join('')}`

				+`<br/><br/>[${dailyDustData.data[0].time} 미세먼지 예보]<br/>${(dailyDustData.data[0].description).split('[미세먼지]').join('')}<br/>(${(dailyDustData.data[0].reason).split('[미세먼지]').join('')})`
				+`<br/><br/>[${dailyDustData.data[1].time} 미세먼지 예보]<br/>${(dailyDustData.data[1].description).split('[미세먼지]').join('')} <br/>(${(dailyDustData.data[1].reason).split('[미세먼지]').join('')})`
				+`<br/><br/>[${dailyDustData.data[2].time} 미세먼지 예보]<br/>${(dailyDustData.data[2].description).split('[미세먼지]').join('')} <br/>${dustDescription2dayAfter}`

				infoHTML += `</div>`
				infoHTML += `<div class="swiper-scrollbar"></div></div>`
				sliderBox.style.zIndex = "0"
				let infoBox = document.getElementById(`local-info-slider-box`)
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
			//console.log(e)
		}
	}else if(currentSliderSelected == 4){
		document.getElementById(`local-weather-box-type`).style.zIndex = 0
		weatherBoxOutline.style.background = `#fff`

		try{
			if(monthlyWeatherData !== null && monthlyWeatherData !== undefined){
				document.getElementById('day-top-weather-box').style.opacity = '0'

				let infoHTML = `
				<div class="swiper-wrapper">
				<div class="swiper-slide local-info-text">`
				+`<br/>
				<h4>[${liveWarningData.reports.main.title}]</h4><br/>
				${liveWarningData.reports.main.context}`
				+`<br/><br/><br/>
				<h4>[${liveWarningData.reports.sub.title}]</h4><br/>
				${liveWarningData.reports.sub.context}`
				//<br/><h2>[실시간 기상정보]</h2>
				+`<br/><br/><br/>
				<h4>[${liveWarningData.reports.info.title}]</h4><br/>
				${liveWarningData.reports.info.context.split('<br /><br />').join('<br/><br/>').split('<br />').join('')}`
				// 여기에 특보 내용을 입력
				/*
				+`<br/><h2>[한국환경공단 미세먼지 예보]</h2>`
				+`<br/>[${dailyDustData.data[0].time}]<br/>${(dailyDustData.data[0].description).split('[미세먼지]').join('')}<br/>(${(dailyDustData.data[0].reason).split('[미세먼지]').join('')})`
				+`<br/><br/>[${dailyDustData.data[1].time}]<br/>${(dailyDustData.data[1].description).split('[미세먼지]').join('')} <br/>(${(dailyDustData.data[1].reason).split('[미세먼지]').join('')})`
				+`<br/><br/>[${dailyDustData.data[2].time}]<br/>${(dailyDustData.data[2].description).split('[미세먼지]').join('')} <br/>${dustDescription2dayAfter}`
				*/

				infoHTML += `</div>`
				infoHTML += `</div><div class="swiper-scrollbar"></div>`
				sliderBox.style.zIndex = "0"
				infoFrontBox.insertAdjacentHTML('beforeend', infoHTML)
				document.getElementById(`day-weather-outline`).style.zIndex = 1

				infoFrontSlider = new Swiper('.local-front-info', {
					direction: 'vertical',
					slidesPerView: 'auto',
					freeMode: true,
					scrollbar: {
						el: '.swiper-scrollbar',
					},
					mousewheel: true,
				})

				let globalHTML = '<div class=swiper-wrapper>'

				// 기상특보 슬라이드 구현
				globalHTML += `<div class="swiper-slide">`
				+ `<img src="${window.armyWeather.private.apiPath}/resources/gif/warning_0.gif" class=global-weather-img-warn></img>`
				+ `</div>`

				// 기상특보 슬라이드 구현
				globalHTML += `<div class="swiper-slide">`
				+ `<img src="${window.armyWeather.private.apiPath}/resources/gif/warning_1.gif" class=global-weather-img-warn></img>`
				+ `</div>`

				// 기상청 태풍
				globalHTML += `<div class="swiper-slide">`
				+ `<div id="global-weather-title-year" style="color: #7a00ff;"><p>태풍 경로</p></div>`
				+ `<div style="
					width:  440px;
					height:  400px;
					position:  absolute;
				"></div>
				<iframe id="ifrm" name="ifrm" src="http://typ.kma.go.kr/TYPHOON/ko/weather/typhoon_01.jsp" style="width: 898px;height: 817px;position:  relative;top: -287px;left: -170px;z-index: -20;transform: scale(0.6, 0.6);" frameborder="0" framespacing="0" marginheight="0" marginwidth="0" scrolling="no" vspace="0"></iframe>`
				+ `</div>`

				globalHTML += `</div>
					<div class="swiper-scrollbar"></div>
					<div class="swiper-button-next swiper-button-white"></div>
					<div class="swiper-button-prev swiper-button-white"></div>`
				globalBox.insertAdjacentHTML('beforeend', globalHTML)

				let isTouchMoved = 0
				graphicSlider = new Swiper('.global-info-slider', {
					slidesPerView: 'auto',
					centeredSlides: false,
					grabCursor: true,
					height: 356,
					autoHeight: false,
					scrollbar: {
						el: '.swiper-scrollbar'
					},
					navigation: {
						nextEl: '.swiper-button-next',
						prevEl: '.swiper-button-prev'
					},
					on: {
						slideChange: ()=>{
							//
						}
					}
				})
			}
		}catch(e){
			//console.log(e)
		}
	}

	// 관측소 정보 출력
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

		// 건구 온도에 값 반영
		if(liveTemp != '-'){
			//document.getElementById(`heat-question-phone-input`).value = AWSLiveData.temp
			//document.getElementById(`heat-question-addr-input`).value = AWSLiveData.temp
			//document.getElementById(`heat-question-rtemp1-input`).value = AWSLiveData.temp
			
			document.getElementById(`heat-question-phone-input`).value = ''
			document.getElementById(`heat-question-addr-input`).value = ''
			document.getElementById(`heat-question-rtemp1-input`).value = ''
		}
	}

	// 기상 특보 정보 출력
	if(liveWarningData !== null && liveWarningData !== undefined){
		//console.log(`liveWarningData:`)
		//console.log(liveWarningData)
	}

	let enteritisIndex = '-'
	let enteritisGrade = '-'
	let enteritisColor = '#fff'

	try{
		if((weeklyHeatdata.length != 0)){
			if(weeklyEnteritis[0] !== undefined && weeklyEnteritis[0] !== null)
				enteritisIndex = weeklyEnteritis[0]
			enteritisGrade = enteritisGradeParse(Number(enteritisIndex))
			enteritisColor = enteritisColorParse(Number(enteritisIndex))
		}
	}catch(e){}

	document.getElementById('day-weather-rain-info2').innerHTML = enteritisIndex // 식중독지수
	document.getElementById('day-weather-rain-info2').style.color = enteritisColor
	document.getElementById('day-weather-rain-info5').style.color = enteritisColor

	document.getElementById('day-weather-rain-info5').innerHTML = `(${enteritisGrade})`

	document.getElementById('weather-type-currently').style.background = (currentSliderSelected == 1) ? '#292929e8' : '#636363b0'
	document.getElementById('weather-type-weekly').style.background = (currentSliderSelected == 2) ? '#292929e8' : '#636363b0'
	document.getElementById('weather-type-korea').style.background = (currentSliderSelected == 3) ? '#292929e8' : '#636363b0'
	document.getElementById('weather-type-dust').style.background = (currentSliderSelected == 4) ? '#292929e8' : '#636363b0'

	// 상황별 자막 출력
	let subtitleHTML = '<div class=swiper-wrapper>'

	let localAdminAddressName = '지역'
	try{
		localAdminAddressName = window.armyWeather.private.address.main.name
	}catch(e){}

	let titleAdminAdder = (subtitleTexts)=>{
		try{
			let areaID = '[' + subtitleTexts.split('[*')[1].split(']')[0] + ']'
			if(areaID == '[지역]') areaID = `[${localAdminAddressName}-뉴스]`
			if(areaID == '[전국]') areaID = `[전국-뉴스]`

			let adminID = subtitleTexts.split('[')[2].split(']')[0]
			let plainText = subtitleTexts.split(']')[2]

			subtitleHTML += 
				`<div class="swiper-slide"> <a class="subtitle-admin-header-text">${areaID}</a> <a class=subtitle-admin-text>${plainText}</a></div>`
		}catch(e){}
	}

	let titleAdder = (subtitleTexts, isHighlight = false)=>{
		let innerSubTitleHeader = subtitleTexts.split(']')[0]+']'
		let innerSubTitleContext = subtitleTexts.split('] ')[1]
		let innerStyleHeaderOption = ``
		let innerStyleOption = ``
		if(isHighlight) innerStyleHeaderOption += `style="color:#d6ff00;"`
		if(isHighlight) innerStyleOption += `style="color:#ffac41;"`
		subtitleHTML += 
			`<div class="swiper-slide"><a class=subtitle-header-text ${innerStyleHeaderOption}>${innerSubTitleHeader} </a><a class=subtitle-context-text ${innerStyleOption}> ${innerSubTitleContext}</a></div>`
	}

	// 최고관리자가 올린 서브타이틀 추가
	if(window.armyWeather.private.SubtitleData !== null && window.armyWeather.private.SubtitleData !== undefined){
		for(let highestAdminSubtitle of window.armyWeather.private.SubtitleData){
			titleAdminAdder(highestAdminSubtitle)
		}
	}
	
	// 지역관리자가 올린 서브타이틀 추가
	try{
		for(let localAdminSubtitle of window.armyWeather.private.localAreaData.data.data.subtitles){
			titleAdminAdder(localAdminSubtitle)
		}
	}catch(e){}
	
	// TODO

	let isNeedToUpdateSubtitle = false

	// 온도지수별 정보갱신
	if(currentTempIndexNum != Number(currentTempIndex) &&
	   enteritisIndexNum != Number(enteritisIndex)){
		isNeedToUpdateSubtitle = true
	}
	
	
	if(oldTextTitle != JSON.stringify(window.armyWeather.private.SubtitleData)){
		
		isNeedToUpdateSubtitle = true
		oldTextTitle = JSON.stringify(window.armyWeather.private.SubtitleData)
	}

	if(isNeedToUpdateSubtitle){
		if(subtitleSlider != null)
			subtitleSlider.destroy()
		subtitleBox.innerHTML = ``

		let ondojisuHeader = '[더위지수]'
		switch(document.getElementById(`day-weather-info4`).innerText){
			case '온도지수:':
				ondojisuHeader = '[온도지수]'
			case '더위지수:':
				let innerCurrentTempIndexNum = Number(document.getElementById(`day-weather-info5`).innerText)
				if(!isNaN(innerCurrentTempIndexNum)){
					if(26.5 > innerCurrentTempIndexNum){
					   titleAdder(`${ondojisuHeader} 야외활동 하기 좋은 지수 입니다`, true)
					}else if(26.5 <= innerCurrentTempIndexNum && innerCurrentTempIndexNum < 29){
						titleAdder(`${ondojisuHeader} 체력저조자 및 신체허약자는 야외할동 각별히 주의`, true)
					}else if(29 <= innerCurrentTempIndexNum && innerCurrentTempIndexNum <= 29.5){
						titleAdder(`${ondojisuHeader} 체력적으로 힘든 작업 및 과중한 활동 지양`, true)
					}else if(29.6 <= innerCurrentTempIndexNum && innerCurrentTempIndexNum <= 30.5){
						titleAdder(`[${ondojisuHeader} 책임자 판단하 옥외활동 조정검토, 온열 손상 방지대책 강구`, true)
					}else if(30.6 <= innerCurrentTempIndexNum && innerCurrentTempIndexNum <= 31){
						titleAdder(`${ondojisuHeader} 옥외활동 제한 및 중지`, true)
					}else if(31.1 <= innerCurrentTempIndexNum && innerCurrentTempIndexNum <= 32){
						titleAdder(`${ondojisuHeader} 1일 6시간 이내의 제한된 활동 가능`, true)
					}else if(32 < innerCurrentTempIndexNum){
						titleAdder(`${ondojisuHeader} 옥외활동은 필수적인 활동만 아침ㆍ저녁시간에 실시`, true)
					}
				}
				break
			case '체감온도':
				break
		}
		

		// 식중독지수별 정보입력
		enteritisIndexNum = Number(enteritisIndex)
		if(!isNaN(enteritisIndexNum)){
			if(enteritisIndexNum < 35){
				titleAdder(`[식중독예방] 부식수령시 서늘하고 습기없는 곳에서 2시간 내 처리`)
				// titleAdder(`[식중독예방] 식품 조리 전 필요한 모든 기구와 기기 청결 유지`)
				// titleAdder(`[식중독예방] 수육/어개류 수령 즉시 메뉴별 구분 처리 후 냉동보관`)
				titleAdder(`[식중독예방] 당일 석식, 익일 조식분 수령 즉시 해동/냉장실 보관`)
				titleAdder(`[식중독예방] 도마, 칼, 보관용기 등을 종류별로 구별사용 준수`)
				titleAdder(`[식중독예방] 해동시 흐르는 물 또는 냉장해동 4시간 이내 실시`)
				titleAdder(`[식중독예방] 조리시 65℃ 이상으로 20분 이상 가열`)
				titleAdder(`[식중독예방] 조리된 음식은 2시간 이내 급식`)
				// titleAdder(`[식중독예방] 식기 / 컵 / 수저 세척 관심`)
				// titleAdder(`[식중독예방] 취사도구 염소소독`)
			}else if(35 <= enteritisIndexNum < 70){
				titleAdder(`[식중독예방] 부식수령시 서늘하고 습기없는 곳에서 1시간 내 처리`)
				titleAdder(`[식중독예방] 주 2회 이상 취사기구류 소독`)
				titleAdder(`[식중독예방] 해동시 흐르는 물 또는 냉장해동 3시간 이내 실시`)
				titleAdder(`[식중독예방] 조리된 음식은 1시간 30분 이내 급식`)
				titleAdder(`[식중독예방] 조리기구 세제로 1차세척, 전용 소독제로 2차세척`)
				titleAdder(`[식중독예방] 컵 / 수저 / 식기 소독기 소독`)
			}else if(70 <= enteritisIndexNum < 95){
				titleAdder(`[식중독예방] 부식 수령시 서늘한 실내에서 30분 이내 처리 후 보관`)
				titleAdder(`[식중독예방] 1일 1회 이상 취사기구류 소독`)
				titleAdder(`[식중독예방] 두채류 수령시 익일 조식내 급식`)
				titleAdder(`[식중독예방] 해동시 흐르는 물 또는 냉장해동 2시간 이내 실시`)
				titleAdder(`[식중독예방] 조리된 음식은 1시간 이내 급식`)
				titleAdder(`[식중독예방] 컵 / 수저 열탕소독`)
			}else if(95 <= enteritisIndexNum){
				titleAdder(`[식중독예방] 부식 수령 즉시 전처리 후 냉장 / 냉동 보관`)
				titleAdder(`[식중독예방] 냉장 / 냉동고 가동상태 수시 확인`)
				titleAdder(`[식중독예방] 생채류 등 생식 금지 / 1일2회 이상 취사기구류 소독`)
				titleAdder(`[식중독예방] 두체류(두부, 순두부)는 수령 당일 급식`)
				titleAdder(`[식중독예방] 급식책임자에의한 당일수령량 범위내 조정급식`)
				titleAdder(`[식중독예방] 조리된 음식은 30분 이내 급식 완료`)
			}
		}
		
	}

	// 이산화질소 no2 표시갱신
	let frontNO2Value = '-'
	let frontNO2Grade = '-'
	try{
		if(liveDustMainData[0]['no2Value'] != '-'){
			frontNO2Value = liveDustMainData[0]['no2Value']
		}else{
			frontNO2Value = liveDustSubData[0]['no2Value']
		}

		if(liveDustMainData[0]['no2Grade'] != ''){
			frontNO2Grade = ozonGradeParse(liveDustMainData[0]['no2Grade'])
		}else{
			frontNO2Grade = ozonGradeParse(liveDustSubData[0]['no2Grade'])
		}
	}catch(e){}
	let frontNO2Color = ozonColorParseUsingText(frontNO2Grade)
	let frontNO2ValueElem = document.getElementById(`front-no2-value`)
	let frontNO2GradeElem = document.getElementById(`front-no2-grade`)
	frontNO2ValueElem.innerText = frontNO2Value
	frontNO2GradeElem.innerText = `[${frontNO2Grade}]`
	frontNO2GradeElem.style.color = frontNO2Color

	// 아황산가스 so2 표시갱신
	let frontSO2Value = '-'
	let frontSO2Grade = '-'
	try{
		if(liveDustMainData[0]['so2Value'] != '-'){
			frontSO2Value = liveDustMainData[0]['so2Value']
		}else{
			frontSO2Value = liveDustSubData[0]['so2Value']
		}

		if(liveDustMainData[0]['so2Grade'] != ''){
			frontSO2Grade = ozonGradeParse(liveDustMainData[0]['so2Grade'])
		}else{
			frontSO2Grade = ozonGradeParse(liveDustSubData[0]['so2Grade'])
		}
	}catch(e){}
	let frontSO2Color = ozonColorParseUsingText(frontSO2Grade)
	let frontSO2ValueElem = document.getElementById(`front-so2-value`)
	let frontSO2GradeElem = document.getElementById(`front-so2-grade`)
	frontSO2ValueElem.innerText = frontSO2Value
	frontSO2GradeElem.innerText = `[${frontSO2Grade}]`
	frontSO2GradeElem.style.color = frontSO2Color

	// 일산화탄소 co 표시갱신
	
	let frontCOValue = '-'
	let frontCOGrade = '-'
	try{
		if(liveDustMainData[0]['coValue'] != '-'){
			frontCOValue = liveDustMainData[0]['coValue']
		}else{
			frontCOValue = liveDustSubData[0]['coValue']
		}

		if(liveDustMainData[0]['coGrade'] != ''){
			frontCOGrade = ozonGradeParse(liveDustMainData[0]['coGrade'])
		}else{
			frontCOGrade = ozonGradeParse(liveDustSubData[0]['coGrade'])
		}
	}catch(e){}

	let frontCOColor = ozonColorParseUsingText(frontCOGrade)
	let frontCoValueElem = document.getElementById(`front-co-value`)
	let frontCoGradeElem = document.getElementById(`front-co-grade`)
	frontCoValueElem.innerText = frontCOValue
	frontCoGradeElem.innerText = `[${frontCOGrade}]`
	frontCoGradeElem.style.color = frontCOColor

	// 대기오염정보 표시 시간 갱신
	try{
		document.getElementById(`front-air-refresh-time`).innerText = window.armyWeather.private.liveDustMainData[0]['name']
	}catch(e){}

	// 자외선지수 표시갱신
	let uvValue = '-'
	let uvGrade = '-'
	try{
		if(weeklyUv !== undefined && weeklyUv !== null){
			let uv = weeklyUv[0]
			uvValue = uv[0]
			uvGrade = uvGradeParse(uvValue)

			if(isNeedToUpdateSubtitle){

				if(uvGrade == '높음'){
					titleAdder(`[자외선지수] 1～2시간 내 햇볕에 노출 시에 피부질환 발생주의`)
				}else if(uvGrade == '경고'){
					titleAdder(`[자외선지수] 수십분 이내 햇볕에 노출 시에도 피부질환 발생주의`)
					titleAdder(`[자외선지수] 10시 ~ 15시까지 야외활동을 자제하는 것을 권고`)
				}else if(uvGrade == '위험'){
					titleAdder(`[자외선지수] 수십분 이내 햇볕에 노출 시에도 피부질환 발생주의`)
					titleAdder(`[자외선지수] 가능한 실내 활동으로 조정`)
				}
			}
		}
	}catch(e){}

	let uvColor = uvColorParse(uvValue)
	let airInfo5 = document.getElementById(`day-air-info5`)
	let airInfo6 = document.getElementById(`day-air-info6`)

	if(uvValue == 'undefined' || uvValue == undefined) uvValue = '-'
	airInfo5.innerText = uvValue
	airInfo5.style.color = uvColor
	airInfo6.innerText = `(${uvGrade})`
	airInfo6.style.color = uvColor

	// 폐질환지수 표시갱신
	let asthmaGrade = '-'
	try{
		if(weeklyAsthma !== undefined && weeklyAsthma !== null){
			asthmaGrade = weeklyAsthma[0]
			if(asthmaGrade == '매우높음') asthmaGrade = '위험'

			if(isNeedToUpdateSubtitle){
				if(asthmaGrade == '높음'){
					titleAdder(`[폐질환지수] 실내를 청결하게 하고 자주 환기하기`)
					titleAdder(`[폐질환지수] 대기오염 증가시 창문을 닫고 공기청정기 사용`)
				}else if(asthmaGrade == '위험'){
					titleAdder(`[폐질환지수] 청결한 환경을 유지하는데 각별히 신경 쓰기`)
					titleAdder(`[폐질환지수] 천식환자들은 각별한 주의 요망`)
				}
			}
		}
	}catch(e){}
	let airInfo12 = document.getElementById(`day-air-info12`)
	
	if(asthmaGrade == null || asthmaGrade == undefined)
		asthmaGrade = `-`
	airInfo12.innerText = `${asthmaGrade}`
	airInfo12.style.color = generalColorParse(asthmaGrade, true)

	// 뇌졸중지수 표시갱신
	let strokeGrade = '-'
	try{
		if(weeklyStroke !== undefined && weeklyStroke !== null){
			strokeGrade = weeklyStroke[0]
			if(strokeGrade == '매우높음') strokeGrade = '위험'

			if(isNeedToUpdateSubtitle){
				if(strokeGrade == '높음'){
					titleAdder(`[뇌졸중지수] 혈압측정을 꾸준히 하면서 정상 혈압이 유지되도록 함`)
					titleAdder(`[뇌졸중지수] 건강에 더욱 관심을 가지고 외출할 경우 보온 유지`)
					titleAdder(`[뇌졸중지수] 온도가 낮은 새벽이나 밤 시간을 피해 외출`)
				}else if(strokeGrade == '위험'){
					titleAdder(`[뇌졸중지수] 꾸준한 혈압, 혈당, 콜레스테롤 수치를 측정필요`)
					titleAdder(`[뇌졸중지수] 날씨 변화에 노출되지 않도록 외출 및 환기에 주의`)
					titleAdder(`[뇌졸중지수] 고혈압 뇌졸중 기왕력 환자들은 각별한 주의 요망`)
				}
			}
		}
	}catch(e){}
	let airInfo18 = document.getElementById(`day-air-info18`)
	if(strokeGrade == null || strokeGrade == undefined)
		strokeGrade = `-`
	airInfo18.innerText = `${strokeGrade}`
	airInfo18.style.color = generalColorParse(strokeGrade, true)

	// 관측 시정 표시갱신
	let viewDistance = '-'

	// 관측 불쾌지수 표시갱신
	let discomfortValue = '-'
	let discomfortGrade = '-'
	try{
		let CITYLiveData = window.armyWeather.private.CITYLiveData
		viewDistance = CITYLiveData.viewDistance
		discomfortValue = Number(CITYLiveData.discomfortIndex)
		discomfortGrade = discomfortGradeParse(discomfortValue)
		if(discomfortGrade == '매우높음') discomfortGrade = '위험'

		if(isNeedToUpdateSubtitle){
			if(discomfortGrade == '높음'){
				titleAdder(`[불쾌지수] 한국인 50% 정도 불쾌감을 느낌`)
				titleAdder(`[불쾌지수] 더위에 약한 사람들은 오후 야외활동 자제`)
			}else if(discomfortGrade == '위험'){
				titleAdder(`[불쾌지수] 대다수가 불쾌감을 느낄 수 있는 날씨입니다.`)
				titleAdder(`[불쾌지수] 더위에 취약한 사람들은 야외활동 자제필요`)
				titleAdder(`[불쾌지수] 수분을 미리 지속적으로 충분히 섭취필요`)
			}
		}

		// 이슬점온도계 +10도로 습구 온도에 값 반영
		if(!isNaN(CITYLiveData.dewPoint)){
			//document.getElementById(`heat-question-name-input`).value = Number(CITYLiveData.dewPoint)+10
			document.getElementById(`heat-question-name-input`).value = ''
		}
	}catch(e){}
	document.getElementById(`day-weather-temp-info4`).innerText = viewDistance

	let airInfoColor = discomfortColorParse(discomfortValue)
	let airInfo15 = document.getElementById(`day-air-info15`)
	let airInfo16 = document.getElementById(`day-air-info16`)
	airInfo15.innerText = discomfortValue
	airInfo15.style.color = airInfoColor
	airInfo16.innerText = `(${discomfortGrade})`
	airInfo16.style.color = airInfoColor

	// 산불위험지수 표시갱신
	let forestValue = '-'
	let forestGrade = '-'
	try{
		let dailyForestData = window.armyWeather.private.dailyForestData
		forestGrade = dailyForestData.grade
		forestValue = Number(dailyForestData.index).toFixed(1)
	}catch(e){}

	let forestColor = generalColorParse(forestGrade, true)
	let airInfo13 = document.getElementById(`day-air-info13`)
	let airInfo14 = document.getElementById(`day-air-info14`)
	airInfo13.innerText = forestValue
	airInfo13.style.color = forestColor
	airInfo14.innerText = `(${forestGrade})`
	airInfo14.style.color = forestColor

	// 산불지수 공지
	if(Number(forestValue) >= 66){
		titleAdder(`[산불위험지수] 대형산불로 확산될 우려가 인정되는 경우`)
	}else if(Number(forestValue) >= 86){
		titleAdder(`[산불위험지수] 대형 산불로 확산될 개연성이 높다고 인정되는 경우`)
	}

	// 생활날씨 슬라이더 구현
	let localAirBoxType = document.getElementById(`local-air-box-type`)
	let airSliderBox = document.getElementById(`local-air-slider-box`)

	localAirBoxType.innerHTML = ''
	airSliderBox.innerHTML = ''
	if(airSlider != null)
		airSlider.destroy()

	try{
		if(dailyWeatherData !== null && dailyWeatherData !== undefined){
			let currentDate = moment()
			let lastAddedDate = null
			// 현재예보 class=local-weather-slider
			let weatherHTML = '<div id=local-air-slider class=swiper-wrapper>'

			let weatherBoxTypeHTML = `
			<a class="local-weather-context">날짜</a><br>
			<a class="local-weather-context-sub">시간</a><br>
			<br>
			<br>
			<img class="local-weather-context-img" src="resources/icons/pack-1/21.png" style="opacity:  0;height: 48px;"></img><br>
			<a class="local-weather-context-sub" style="top: 4px;">날씨</a><br>
			<a class="local-weather-context-sub" style="font-size: 13px;">식중독지수</a><br>
			<a class="local-weather-context-sub" style="font-size: 15px;">불쾌지수</a><br>
			<a class="local-weather-context-sub" style="font-size: 14px;">열지수</a><br>
			<a class="local-weather-context-sub" style="font-size: 14px;">자외선지수</a><br>
			<a class="local-weather-context-sub">폐질환지수</a><br>
			<a class="local-weather-context-sub">뇌졸중지수</a><br>`

			localAirBoxType.insertAdjacentHTML('beforeend', weatherBoxTypeHTML)

			for(let dailyData of dailyWeatherData.forecast.daily){
				let currentAddDate = '-'
				let currentAddedDateCount = Number(dailyData.day)

				let targetHour = getDayHour(currentAddedDateCount, Number(dailyData.hour))

				// 열지수
				let heatIndex = (weeklyHeatindex.length == 0) ? '-' : weeklyHeatindex[targetHour]
				if(heatIndex == null || heatIndex == undefined || heatIndex =='null') heatIndex = `-`

				// 식중독지수
				let enteritis = (weeklyEnteritis.length == 0) ? '-' : weeklyEnteritis[currentAddedDateCount]
				if(enteritis == null || enteritis == 'null') enteritis = `-`

				// 자외선지수
				let uvIndex = (weeklyUv.length == 0) ? '-' : weeklyUv[currentAddedDateCount]
				if(uvIndex == null || uvIndex == 'null') uvIndex = `-`
				
				// 불쾌지수
				let discomfortIndex = (weeklyDiscomfort.length == 0) ? '-' : weeklyDiscomfort[currentAddedDateCount]
				if(discomfortIndex == null || discomfortIndex == 'null') discomfortIndex = `-`
				
				// 폐질환지수
				let innerAsthma = (weeklyAsthma.length == 0) ? '-' : weeklyAsthma[currentAddedDateCount]
				if(innerAsthma == '매우높음') innerAsthma = '위험'
				if(innerAsthma == null || innerAsthma == 'null') innerAsthma = `-`

				// 뇌졸중지수
				let innerStroke = (weeklyStroke.length == 0) ? '-' : weeklyStroke[currentAddedDateCount]
				if(innerStroke == '매우높음') innerStroke = '위험'
				if(innerStroke == null || innerStroke == 'null') innerStroke = `-`

				let nextDate = moment(currentDate).add(currentAddedDateCount, 'days').format('M/D')
				let currentWeekDay = ''
				if(lastAddedDate != nextDate){
					currentAddDate = nextDate
					lastAddedDate = nextDate
					currentWeekDay = `(${(currentWeekDayParse(moment(currentDate).add(currentAddedDateCount, 'days').days()))})`
				}

				let rainSnowAmount = '0.0'
				if(dailyData.weather >= 2) rainSnowAmount = dailyData.snowAmountAfter6Hour
					else  rainSnowAmount = dailyData.rainAmountAfter6Hour

				let windSpeed = Number(dailyData.windSpeed).toFixed(1)

				let enteritisColor = enteritisColorParse(Number(enteritis))
				let discomfortIndexColor = discomfortColorParse(Number(discomfortIndex))
				let heatIndexColor = heatIndexColorParse(Number(heatIndex))
				let uvIndexColor = uvColorParse(Number(uvIndex))
				let innerAsthmaColor = generalColorParse(innerAsthma)
				let innerStrokeColor = generalColorParse(innerStroke)
				//document.getElementById('day-weather-rain-info2').style.color = enteritisColor
				//document.getElementById('day-weather-rain-info5').style.color = enteritisColor
				// 아이콘 구현
				weatherHTML += `<div class="swiper-slide"><div class="local-weather-message unselectable">`
				weatherHTML += `<a class="local-weather-context-day local-weather-context">${currentAddDate}${currentWeekDay}` + `</a><br>`
				weatherHTML += `<a class="local-weather-context-sub">${dailyData.hour}시</a><br>`
				weatherHTML += `<br>`
				weatherHTML += `<br>`
				weatherHTML += `<img class=local-weather-context-img src="${getWeatherIcon(dailyData.hour, dailyData.cloudKR)}" class=day-status-img></img><br>`
				weatherHTML += `<a class="local-weather-context-sub-bold" style="top: 4px;">${(dailyData.cloudKR).split(' ').join('')}` + `</a><br>`
				weatherHTML += `<a class="local-weather-context-sub-bold" style="color:${enteritisColor};font-size: 18px;">${enteritis}` + `</a><br>`
				weatherHTML += `<a class="local-weather-context-sub-bold" style="color:${discomfortIndexColor};font-size: 18px;">${discomfortIndex}` + `</a><br>`
				weatherHTML += `<a class="local-weather-context-sub-bold" style="color:${heatIndexColor};font-size: 18px;">${heatIndex}` + `</a><br>`
				weatherHTML += `<a class="local-weather-context-sub-bold" style="color:${uvIndexColor};font-size: 18px;">${uvIndex}` + `</a><br>`
				weatherHTML += `<a class="local-weather-context-sub-bold" style="color:${innerAsthmaColor}">${innerAsthma}` + `</a><br>`
				weatherHTML += `<a class="local-weather-context-sub-bold" style="color:${innerStrokeColor}">${innerStroke}` + `</a><br>`
				weatherHTML += `</div></div>`
			}
			weatherHTML += `</div><div class="swiper-scrollbar"></div>`
			airSliderBox.insertAdjacentHTML('beforeend', weatherHTML)

			airSlider = new Swiper('.local-air-slider', {
				slidesPerView: 6,
				centeredSlides: false,
				grabCursor: true,
				scrollbar: {
					el: '.swiper-scrollbar',
					hide: true,
				},
				zoom: {
					maxRatio: 2
				}
			})
			
			let infoImgBox = document.getElementById(`info-img-box`)
			let healthPannel = document.getElementById(`health-pannel`)
			let descriptionButtonInfo = document.getElementById(`open-description1`)
			let upwardButton = document.getElementById(`health-upward`)

			if(descriptionOpened){
				descriptionButtonInfo.innerText = '설명닫기'
				healthPannel.style.height = 'auto'
				
				infoImgBox.style.opacity = 1
				infoImgBox.style.zIndex = 0
				infoImgBox.style.height = 'auto'
				upwardButton.style.zIndex = 1
				upwardButton.style.opacity = 1

				infoImgSlider = new Swiper('.info-img-slider', {
						slidesPerView: 'auto',
						lazy: true,
						centeredSlides: false,
						grabCursor: true,
						autoHeight: true,
						zoom: true,
						pagination: {
							el: '.swiper-pagination',
							type: 'progressbar'
						}
				})
				infoImgSlider.lazy.loadInSlide(0)
				infoImgSlider.lazy.loadInSlide(1)
				infoImgSlider.lazy.loadInSlide(2)
				infoImgSlider.lazy.loadInSlide(3)
				infoImgSlider.lazy.loadInSlide(4)
				infoImgSlider.lazy.loadInSlide(5)
				infoImgSlider.lazy.loadInSlide(6)
				infoImgSlider.lazy.loadInSlide(7)
				infoImgSlider.lazy.loadInSlide(8)
				infoImgSlider.lazy.loadInSlide(9)
			}else{
				descriptionButtonInfo.innerText = '기상상식'
				healthPannel.style.height = 840
				infoImgBox.style.opacity = 0
				infoImgBox.style.zIndex = -1
				infoImgBox.style.height = 0
				upwardButton.style.zIndex = -1
				upwardButton.style.opacity = 0
			}
		}
	}catch(e){}

	if(isNeedToUpdateSubtitle){

		// 자막 슬라이더 구현
		subtitleHTML += `</div>`
		subtitleBox.insertAdjacentHTML('beforeend', subtitleHTML)

		subtitleSlider = new Swiper('.subtitle-address-slider', {
			direction: 'vertical',
			slidesPerView: 1,
			loop: true,
			mousewheel: true,
			autoplay: {
				delay: 5000,
				disableOnInteraction: false
			},
		})

		// 설명 슬라이더 구현
		descriptionHTML += `</div>`
	}
	
	descriptionBox.innerHTML = ``
	descriptionBox.insertAdjacentHTML('beforeend', descriptionHTML)

	if(weatherDescriptionSlider != null)
		weatherDescriptionSlider.destroy()

	weatherDescriptionSlider = new Swiper('.day-weather-description-slider', {
		direction: 'vertical',
		slidesPerView: 1,
		loop: true,
		mousewheel: true,
		autoplay: {
			delay: 2500,
			disableOnInteraction: false
		},
	})

	// 추측정보로 체감온도 및 온도지수 예비계산 실행
	HeatCalculate()
	
	// 마지막 전파인원 정보 출력
	let reporterID = '-'
	let reportedTime = '-'
	try{
		if(window.armyWeather.private.localAreaData.data.data.reportedTime !== undefined
		  && window.armyWeather.private.localAreaData.data.data.reportedTime !== null)
			reportedTime = window.armyWeather.private.localAreaData.data.data.reportedTime

		if(reportedTime !== '-')
			reportedTime = moment(reportedTime).format('H')

		if(window.armyWeather.private.localAreaData.data.account !== undefined
		  && window.armyWeather.private.localAreaData.data.account !== null)
			reporterID = window.armyWeather.private.localAreaData.data.account
	}catch(e){}
	document.getElementById(`heat-reporter-info`).innerText = `기상알림: ${reporterID} (${reportedTime}시 기준)`
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
					
					if(typeof registeredUpdateCallback =='function'){
						registeredUpdateCallback()
						registeredUpdateCallback = null
					}
					break
				}
			}
		}
	}
	
	innerLoader(keyData)
}


export function LocalWeatherUpdate (updateCallback){
	registeredUpdateCallback = updateCallback

	// 만약 기본 주소가 설정되어 있지 않은 상태라면
	// 아이피 주소를 기반으로 좌표를 찾아낸 후
	// 해당 좌표를 기반으로 주소를 찾아내는 작업을 시도합니다.

	if(window.armyWeather.private.address.main === null){
		//window.armyWeather.util.geoip((geoIpData)=>{
		//if(typeof geoIpData['lat'] != 'undefined'
		//	|| typeof geoIpData['lon'] != 'undefined'){

		//let clientLat = geoIpData['lat']
		//let clientLong = geoIpData['lon']

		// IP 위치추적 없이 그냥 좌표로 직접 적용
		let clientLat = 37.56356944444444
		let clientLong = 126.98000833333333

		// 기상청 cell 정보와 기본 시군구 정보를 얻어옵니다.
		API.call('/api/address',{coord:[clientLat, clientLong]},(paramData)=>{

			// GPS가 선택된 경우만 main 으로 정보 추가
			if(window.armyWeather.private.address.index == 1)
				window.armyWeather.private.address.main = paramData.data

			window.armyWeather.private.address.gps = paramData.data
			let addressLastNamePre = paramData.data.key.split('.')
			let addressLastName = addressLastNamePre[addressLastNamePre.length-1]

			if(document.getElementById(`day-weather-location-info2`) !== null)
				document.getElementById(`day-weather-location-info2`).innerHTML = addressLastName

			// 위치를 다 찾아내고 반영하였다면
			// 계속해서 날씨 정보를 얻어옵니다.
			LocalWeatherUpdate()
			UpdateAddressBar()
		})
		//}
		//})
		return
	}

	needToLoadCount = keyData.length

	API.call('/api/weather', {
		cell: window.armyWeather.private.address.main.cell,
		type: 'live'
	}, (liveWeatherData)=>{

		LocalWeatherDataLoader({liveWeatherData})
	})

	API.call('/api/areadata-read', {
		cell: window.armyWeather.private.address.main.cell
	}, (localAreaData)=>{
		LocalWeatherDataLoader({localAreaData})
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
	}, (liveDustMainData)=>{

		LocalWeatherDataLoader({liveDustMainData})
	})
	
	// 미세먼지 정보를 얻어옵니다.
	API.call('/api/dust', {
		x: Number(window.armyWeather.private.address.main.lat),
		y: Number(window.armyWeather.private.address.main.long),
		type: 'sub'
	}, (liveDustSubData)=>{

		LocalWeatherDataLoader({liveDustSubData})
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

	API.call('/api/forest', {
		x: Number(window.armyWeather.private.address.main.lat),
		y: Number(window.armyWeather.private.address.main.long)
	}, (dailyForestData)=>{

		LocalWeatherDataLoader({dailyForestData})
	})

	API.call('/api/dustpic', {}, (weeklyDustData)=>{
		LocalWeatherDataLoader({weeklyDustData})
	})

	API.call('/api/awslive', {
		x: Number(window.armyWeather.private.address.main.lat),
		y: Number(window.armyWeather.private.address.main.long)
	}, (AWSLiveData)=>{

		LocalWeatherDataLoader({AWSLiveData})
	})

	API.call('/api/citylive', {
		x: Number(window.armyWeather.private.address.main.lat),
		y: Number(window.armyWeather.private.address.main.long)
	}, (CITYLiveData)=>{

		LocalWeatherDataLoader({CITYLiveData})
	})

	API.call('/api/warning', {}, (liveWarningData)=>{
		LocalWeatherDataLoader({liveWarningData})
	})
	API.call('/api/subtitle', {}, (SubtitleData)=>{
		LocalWeatherDataLoader({SubtitleData})
	})

	API.call('/api/uv', {
		x: Number(window.armyWeather.private.address.main.lat),
		y: Number(window.armyWeather.private.address.main.long)
	}, (weeklyUv)=>{

		LocalWeatherDataLoader({weeklyUv})
	})

	API.call('/api/discomfort', {
		x: Number(window.armyWeather.private.address.main.lat),
		y: Number(window.armyWeather.private.address.main.long)
	}, (weeklyDiscomfort)=>{

		LocalWeatherDataLoader({weeklyDiscomfort})
	})

	API.call('/api/asthma', {
		x: Number(window.armyWeather.private.address.main.lat),
		y: Number(window.armyWeather.private.address.main.long)
	}, (weeklyAsthma)=>{

		LocalWeatherDataLoader({weeklyAsthma})
	})

	API.call('/api/heatindex', {
		x: Number(window.armyWeather.private.address.main.lat),
		y: Number(window.armyWeather.private.address.main.long)
	}, (weeklyHeatindex)=>{

		LocalWeatherDataLoader({weeklyHeatindex})
	})

	API.call('/api/stroke', {
		x: Number(window.armyWeather.private.address.main.lat),
		y: Number(window.armyWeather.private.address.main.long)
	}, (weeklyStroke)=>{

		LocalWeatherDataLoader({weeklyStroke})
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
	document.getElementById('open-description').addEventListener('click', (event)=>{
		descriptionOpened = (!descriptionOpened)
		LocalWeatherRedraw()
	})

	// 날씨 업데이트 버튼 구현
	document.getElementById('read-guide').addEventListener('click', (event)=>{
		LocalWeatherUpdate()
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

/*
WEBGLSupportCheck

				// meteoblue 위성지도 슬라이드 구현
				+ `<div class="swiper-slide">`
				+ `<div id="global-weather-title" style="color: #516d77;"><p>기상 레이더</p></div>`
				+ `<iframe id="ifrm" name="ifrm" src="https://www.meteoblue.com/en/weather/maps/index#36.485N130.254E_KST+09:00" style="width: 100%;height: 82%;position:  relative;top: 33px;" frameborder="0" framespacing="0" marginheight="0" marginwidth="0" scrolling="no" vspace="0"></iframe>`
				+ `</div>`

				// landsat 위성지도 슬라이드 구현
				+ `<div class="swiper-slide">`
				+ `<div id="global-weather-title" style="color: #516d77;width: 140px;left: calc(50% - 70px);"><p>최신 랜드셋 위성지도</p></div>`
				+ `<div id="landset-control"><iframe id="ifrm2" name="ifrm" src="https://www.mapbox.com/bites/00145/#7/36.465/127.936" style="width: 109%;height: 127%;position:  relative;" frameborder="0" framespacing="0" marginheight="0" marginwidth="0" scrolling="no" vspace="0" hspace="0"></iframe></div>`
				+ `</div>`

*/