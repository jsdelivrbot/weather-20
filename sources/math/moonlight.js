import lune from 'lune'
import moment from 'moment'

export function MoonCalculate (targetDate, utc){
	var dailyData = lune.phase(targetDate)
	let monthlyData = lune.phase_hunt(targetDate)

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
		moonPhaseDescription = '무월광'
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