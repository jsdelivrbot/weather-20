import moment from 'moment'
import {EncodeMGRS, DecodeMGRS} from '../../math/mgrs.js'
import {LightCalculate} from '../../math/light.js'
import {updateCalendar} from '../life/calendar.js'

let utc = '+09:00'
let localInputFormat = 'YYYY/MM/DD HH:mm:ss'
let localFormat = 'MM월 DD일 HH시 mm분'
let localSimpleFormat = ['HH:mm', 'MM/DD']


// 현재시간 얻기
let timeNewest = document.getElementById('coord-time-newest')
let timeNewestInput = document.getElementById('coord-time-input')
let timeNewestProcess = ()=>{

	let targetMoment = moment()
	let targetDate = new Date(targetMoment.utcOffset(utc))
	let newestDate = moment(targetDate).utcOffset(utc).format(localInputFormat)
	timeNewestInput.value = newestDate
}


// 현재위치 얻기
let coordNewest = document.getElementById('coord-newest')
let coordLatLngInput = document.getElementById('coord-latlng-input')
let coordMGRSInput = document.getElementById('coord-mgrs-input')
let coordNewestProcess = (callback)=>{
	window.armyWeather.util.geoip((geoIpData)=>{
		if(typeof geoIpData['lat'] != 'undefined'
			|| typeof geoIpData['lon'] != 'undefined'){

			let clientLat = geoIpData['lat']
			let clientLong = geoIpData['lon']
			let clientMGRS = EncodeMGRS(clientLat, clientLong)

			coordLatLngInput.value = `${clientLat} ${clientLong}`
			coordMGRSInput.value = clientMGRS
			if(typeof callback == 'function') callback()
		}
	})
}


// MGRS->경위도
let mgrsToLatLng = document.getElementById('coord-mgrs-to-latlng')
let mgrsToLatLngProcess = ()=>{

	// 변환 실패시 기본값
	let decoded = [36.0, 127.0]
	try{ decoded = DecodeMGRS(coordMGRSInput.value) } catch(e){ }

	coordLatLngInput.value = `${decoded[0].toFixed(5)} ${decoded[1].toFixed(5)}`
}


// 경위도->MGRS
let latLngToMgrs = document.getElementById('coord-latlng-to-mgrs')
export function parseCoordLatLngInput (){
	let paramLat = 36.0
	let paramLong = 127.0

	let parseLatLng = (coordLatLngInput.value).split(' ')
	if(parseLatLng.length == 2){
		let parsedLat = Number(parseLatLng[0])
		let parsedLong = Number(parseLatLng[1])

		if(!isNaN(parsedLat) && !isNaN(parsedLong)){
			paramLat = parsedLat
			paramLong = parsedLong
		}
	}
	return [paramLat, paramLong]
}

let latLngToMgrsProcess = ()=>{
	let paramDegree = parseCoordLatLngInput()
	coordMGRSInput.value = EncodeMGRS(paramDegree[0], paramDegree[1])
}


// 입력내용 반영
let apply = document.getElementById('coord-apply')
export function timeNewestInputParse (){
	let paramTime = new Date()

	try{
		paramTime = timeNewestInput.value
		paramTime = paramTime.split('/').join('-').split(' ').join('T') + utc
	} catch(e){ }

	return new Date(paramTime)
}

export function getLightData(paramTime){
	/*
	let paramDegree = parseCoordLatLngInput()
	if(paramTime === undefined) paramTime = timeNewestInputParse()
	let lightData = LightCalculate(paramTime, paramDegree[0], paramDegree[1], utc, localFormat, localSimpleFormat)
	return lightData
	*/
	let lat = 36
	let long = 127
	if(paramTime === undefined) paramTime = new Date()
	if(window.armyWeather.private.address.main !== null && window.armyWeather.private.address.main !== undefined){
		lat = window.armyWeather.private.address.main.lat
		long = window.armyWeather.private.address.main.long
	}else if(window.armyWeather.private.address.gps !== null && window.armyWeather.private.address.gps !== undefined){
		lat = window.armyWeather.private.address.gps.lat
		long = window.armyWeather.private.address.gps.long
	}

	let lightData = LightCalculate(paramTime, lat, long, utc, localFormat, localSimpleFormat)
	return lightData
}

let applyProcess = ()=>{
	let lightData = getLightData()

	// BMNT
	document.getElementById('day-weather-sun-rise-info4').innerHTML = lightData.dawn
	// EENT
	document.getElementById('day-weather-sun-set-info4').innerHTML = lightData.dusk

	// 월출
	document.getElementById('day-weather-moon-rise-info2').innerHTML = lightData.moonRise
	// 월몰
	document.getElementById('day-weather-moon-set-info7').innerHTML = lightData.moonSet

	// 일출
	document.getElementById('day-weather-sun-rise-info2').innerHTML = lightData.sunRise
	// 일몰
	document.getElementById('day-weather-sun-set-info2').innerHTML = lightData.sunSet

	// 가장 밝아질 때
	//document.getElementById('day-sun-info2').innerHTML = lightData.light
	// 가장 어두울 때
	//document.getElementById('day-sun-info4').innerHTML = lightData.night

	// 현재 해 고도
	//document.getElementById('day-weather-sun-altitude-info2').innerHTML = `${lightData.sunAltitude}°`
	// 현재 해 방위
	//document.getElementById('day-weather-sun-azimuth-info2').innerHTML = `${lightData.sunAzimuth}°`

	// 현재 달 고도
	//document.getElementById('day-weather-sun-altitude-info2').innerHTML = `${lightData.moonAltitude}°`
	// 현재 달 방위
	//document.getElementById('day-weather-sun-azimuth-info2').innerHTML = `${lightData.moonAzimuth}°`

	// 실시간 달 밝기예측
	//document.getElementById('day-moon-info2').innerHTML = `${lightData.moonLightPercentage}% (${lightData.moonLightLux}lux)`
	// 자정대 달 밝기예측
	//document.getElementById('day-moon-info4').innerHTML = `${lightData.moonActualLightPercentage.toFixed(0)}%`
	document.getElementById('day-weather-moon-set-info2').innerHTML = `${lightData.moonActualLightPercentage.toFixed(0)}%`
	document.getElementById('day-weather-moon-set-info2').innerHTML = `${lightData.pastMoonActualLightPercentage.toFixed(0)}%`
	
	// 실시간 달 위상예측
	//document.getElementById('day-moon-info6').innerHTML = `${lightData.moonPhaseDescription} (${lightData.moonPhaseActualPercentage}% 차오름)`
	document.getElementById(`day-weather-moon-set-info5`).innerHTML = `(${lightData.moonPhaseDescription})`

	// 최근 만월예측
	// document.getElementById('day-weather-moon-set-info5').innerHTML = `최근 만월예측: ${lightData.recentFullMoonDate}`
	// 최근 월삭예측
	// document.getElementById('day-weather-moon-set-info2').innerHTML = lightData.recentNewMoonDate
	// 다음 월삭예측
	document.getElementById('day-weather-moon-set-info4').innerHTML = lightData.nextNewMoonDate
}


// 실시간 갱신
let autoNewest = document.getElementById('coord-auto-newest')
let isAutoNewestUse = false
let autoNewestProcess = ()=>{

	// autoNewest
	// background: #f0c419;
	// border-color: #f0c419;
}

export function CoordInit (){

	// 현재시간을 미리 얻어옵니다.
	timeNewestProcess()

	// 현재좌표를 미리 얻어옵니다.
	coordNewestProcess(()=>{

		// 얻어온 시간과 좌표로
		// 미리 데이터를 계산해서 출력합니다.
		applyProcess()
		
		let index = null
		setInterval(()=>{
			if(index != window.armyWeather.private.address.index){
				applyProcess()
				updateCalendar()
				index = window.armyWeather.private.address.index
			}
		}, 500) // 0.5초마다 자동 갱신하게 설정
	})

	// 버튼과 처리함수를 연동시킵니다.
	timeNewest.addEventListener('click', timeNewestProcess)
	coordNewest.addEventListener('click', coordNewestProcess)
	mgrsToLatLng.addEventListener('click', mgrsToLatLngProcess)
	latLngToMgrs.addEventListener('click', latLngToMgrsProcess)
	apply.addEventListener('click', applyProcess)
}