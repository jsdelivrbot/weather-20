
import moment from 'moment'

import {LightCalculate} from './sources/math/light.js'
import {EncodeMGRS, DecodeMGRS} from './sources/math/mgrs.js'

let utc = `+09:00`
let localFormat = 'MM월 DD일 HH시 mm분'

let targetMoment = moment()
let targetDate = new Date(targetMoment.utcOffset(utc))

let lat = 36.12345
let long = 127.12345

function CoordinatesTest(){
	let mgrs = EncodeMGRS(lat, long)
	let reversedLatLng = DecodeMGRS(mgrs)
	console.log(mgrs)
	console.log(reversedLatLng)
}

//CoordinatesTest()
/*
let paramTime = '2018/06/10 13:46:16'
paramTime = paramTime.split('/').join('-').split(' ').join('T')+utc
console.log(paramTime)
let parsedTime = new Date(paramTime)
console.log(parsedTime.toString())
*/

function LightTest(){
	let lightData = LightCalculate(targetDate, lat, long, utc, localFormat)
	console.log(`현재 일자: ${moment(targetDate).utcOffset(utc).format(localFormat)}`)
	console.log(` `)
	console.log(`해가 뜨는 시간: ${lightData.sunRise}`)
	console.log(`해상박명초: ${lightData.dawn}`)

	console.log(`해가 지는 시간: ${lightData.sunSet}`)
	console.log(`해상박명종: ${lightData.dusk}`)
	console.log(` `)
	console.log(`가장 밝아질 때: ${lightData.light}`)
	console.log(`가장 어두울 때: ${lightData.night}`)
	console.log(` `)
	console.log(` `)
	console.log(`달이 뜨는 시간: ${lightData.moonRise}`)
	console.log(`달이 지는 시간: ${lightData.moonSet}`)
	console.log(` `)
	console.log(`현재 해 고도: ${lightData.sunAltitude}°`)
	console.log(`현재 해 방위: ${lightData.sunAzimuth}°`)
	console.log(` `)
	console.log(`현재 달 고도: ${lightData.moonAltitude}°`)
	console.log(`현재 달 방위: ${lightData.moonAzimuth}°`)
	console.log(` `)
	console.log(`실시간 달 밝기예측: ${lightData.moonLightPercentage}% (${lightData.moonLightLux}lux)`)
	console.log(`자정대 달 밝기예측: ${lightData.moonActualLightPercentage}% (${lightData.moonActualLightLux}lux)`)
	console.log(`실시간 달 위상예측: ${lightData.moonPhaseDescription} (${lightData.moonPhaseActualPercentage}% 차오름)`)
	console.log(` `)
	console.log(`최근 만월예측: ${lightData.recentFullMoonDate}`)
	console.log(`최근 월삭예측: ${lightData.recentNewMoonDate}`)
	console.log(`다음 월삭예측: ${lightData.nextFullMoonDate}`)
}

