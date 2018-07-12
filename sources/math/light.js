import SunCalc from 'suncalc'
import Lune from 'lune'

import moment from 'moment'

function faultCheck(str){
	if(str == 'Invalid date')
		return '계산 불가'
	return str
}

export function LightCalculate(paramDate, paramLat, paramLong, paramUtc, paramFormat, localSimpleFormat=['HH:mm', 'MM/DD']){

	let sunTimeData = SunCalc.getTimes(paramDate, paramLat, paramLong)
	let night = faultCheck(moment(sunTimeData.nadir).utcOffset(paramUtc).format(paramFormat))
	let light = faultCheck(moment(sunTimeData.solarNoon).utcOffset(paramUtc).format(paramFormat))
	let dawn = faultCheck(moment(sunTimeData.nauticalDawn).utcOffset(paramUtc).format(localSimpleFormat[0]))
	let dusk = faultCheck(moment(sunTimeData.nauticalDusk).utcOffset(paramUtc).format(localSimpleFormat[0]))

	let moonTimeData = SunCalc.getMoonTimes(paramDate, paramLat, paramLong)
	let sunRise = faultCheck(moment(sunTimeData.dawn).utcOffset(paramUtc).format(localSimpleFormat[0]))
	let sunSet = faultCheck(moment(sunTimeData.dusk).utcOffset(paramUtc).format(localSimpleFormat[0]))
	
	let moonRise = faultCheck(moment(moonTimeData.rise).utcOffset(paramUtc).format(localSimpleFormat[0]))
	let moonSet = faultCheck(moment(moonTimeData.set).utcOffset(paramUtc).format(localSimpleFormat[0]))
	if(typeof moonTimeData['rise'] == 'undefined') moonRise = '--:--'
	if(typeof moonTimeData['set'] == 'undefined') moonSet = '--:--'

	let sunPosData = SunCalc.getPosition(paramDate, paramLat, paramLong)
	let sunAltitude = (sunPosData.altitude * (180 / Math.PI)).toFixed(2)
	let sunAzimuth = (sunPosData.azimuth * (180 / Math.PI)).toFixed(2)

	let moonPosData = SunCalc.getMoonPosition(paramDate, paramLat, paramLong)
	let moonAltitude = (moonPosData.altitude * (180 / Math.PI)).toFixed(2)
	let moonAzimuth = (moonPosData.azimuth * (180 / Math.PI)).toFixed(2)


	let midnight = new Date(moment(Number(paramDate)).utcOffset(paramUtc).add(0, 'days').hour(0).minute(0))
	let pastMidnight = new Date(moment(Number(paramDate)).utcOffset(paramUtc).add(1, 'days').hour(0).minute(0))

	let dailyData = Lune.phase(paramDate)
	let monthlyData = Lune.phase_hunt(paramDate)

	let moonLightPercentage = Number((dailyData.illuminated*100).toFixed(2))
	let moonLightLux = (0.27*dailyData.illuminated).toFixed(4)

	let midnightData = Lune.phase(midnight)
	let moonActualLightPercentage = Number((midnightData.illuminated*100).toFixed(2))
	let moonActualLightLux = (0.27*midnightData.illuminated).toFixed(4)

	let pastMidnightData = Lune.phase(pastMidnight)
	let pastMoonActualLightPercentage = Number((pastMidnightData.illuminated*100).toFixed(2))
	let pastMoonActualLightLux = (0.27*pastMidnightData.illuminated).toFixed(4)
	
	let moonPhasePercentage = Number((dailyData.phase*100).toFixed(2))
	let moonPhaseActualPercentage = 0
	let moonPhaseDescription = ''

	if(5 <= moonPhasePercentage && moonPhasePercentage <=25){
		moonPhaseActualPercentage = (moonPhasePercentage-5)/20*100
		moonPhaseDescription = '초승달'
	} else if(25 < moonPhasePercentage && moonPhasePercentage <= 55){
		moonPhaseActualPercentage = (moonPhasePercentage-25)/30*100
		moonPhaseDescription = '상현달'
	} else if(55 < moonPhasePercentage && moonPhasePercentage <= 75){
		moonPhaseActualPercentage = (moonPhasePercentage-55)/20*100
		moonPhaseDescription = '보름달'
	}else if(75 < moonPhasePercentage && moonPhasePercentage <= 95){
		moonPhaseActualPercentage = (moonPhasePercentage-75)/20*100
		moonPhaseDescription = '그믐달'
	}else {
		if(5 >= moonPhasePercentage)
			moonPhaseActualPercentage = (moonPhasePercentage+5)/10*100
		else
			moonPhaseActualPercentage = (moonPhasePercentage-95)/10*100
		moonPhaseDescription = '하현달'
	}

	moonPhaseActualPercentage = Number(moonPhaseActualPercentage.toFixed(0))

	return {
		dawn,
		dusk,
		light,
		night,

		sunRise,
		sunSet,
		moonRise,
		moonSet,

		sunAltitude,
		sunAzimuth,
		moonAltitude,
		moonAzimuth,
		
		moonLightPercentage,
		moonLightLux,
		moonActualLightPercentage,
		moonActualLightLux,

		moonPhaseDescription,
		moonPhasePercentage,
		moonPhaseActualPercentage,
		
		pastMoonActualLightPercentage,
		pastMoonActualLightLux,

		recentNewMoonDate: moment(Number(monthlyData.new_date)).utcOffset(paramUtc).format(localSimpleFormat[1]),
		recentFullMoonDate: moment(Number(monthlyData.full_date)).utcOffset(paramUtc).format(paramFormat),
		nextNewMoonDate: moment(Number(monthlyData.nextnew_date)).add(-2, 'days').utcOffset(paramUtc).format(localSimpleFormat[1])
	}
}

export function MoonCalculate (targetDate, utc){
	var dailyData = Lune.phase(targetDate)
	let monthlyData = Lune.phase_hunt(targetDate)

	let moonLightPercentage = Number((dailyData.illuminated*100).toFixed(2))
	let moonLightLux = (0.27*dailyData.illuminated).toFixed(4)
	let moonPhasePercentage = Number((dailyData.phase*100).toFixed(2))
	let moonPhaseActualPercentage = 0
	let moonPhaseDescription = ''

	if(5 <= moonPhasePercentage && moonPhasePercentage <=25){
		moonPhaseActualPercentage = (moonPhasePercentage-5)/20*100
		moonPhaseDescription = '초승달'
	} else if(25 < moonPhasePercentage && moonPhasePercentage <= 55){
		moonPhaseActualPercentage = (moonPhasePercentage-25)/30*100
		moonPhaseDescription = '반달'
	} else if(55 < moonPhasePercentage && moonPhasePercentage <= 75){
		moonPhaseActualPercentage = (moonPhasePercentage-55)/20*100
		moonPhaseDescription = '보름달'
	}else if(75 < moonPhasePercentage && moonPhasePercentage <= 95){
		moonPhaseActualPercentage = (moonPhasePercentage-75)/20*100
		moonPhaseDescription = '그믐달'
	}else {
		if(5 >= moonPhasePercentage)
			moonPhaseActualPercentage = (moonPhasePercentage+5)/10*100
		else
			moonPhaseActualPercentage = (moonPhasePercentage-95)/10*100
		moonPhaseDescription = '삭'
	}

	moonPhaseActualPercentage = Number(moonPhaseActualPercentage.toFixed(0))

	return {
		moonLightPercentage: moonLightPercentage,
		moonLightLux: moonLightLux,
		moonPhaseDescription: moonPhaseDescription,
		moonPhaseActualPercentage: moonPhaseActualPercentage,
		recentNewMoonDate: moment(Number(monthlyData.new_date)).utcOffset(utc),
		recentFullMoonDate: moment(Number(monthlyData.full_date)).utcOffset(utc),
		nextFullMoonDate: moment(Number(monthlyData.nextnew_date)).utcOffset(utc)
	}
}