import moment from 'moment'
import Calendar from '../../math/calendar.js'
import {getLightData} from '../weather/coord.js'

let targetCalendar = document.getElementById('moon-plan-calendar')
let currentMonth = document.getElementById('moon-current-month')
let currentYear = document.getElementById('moon-current-year')
let monthPrevButton = document.getElementById('moon-month-prev')
let monthNextButton = document.getElementById('moon-month-next')

// 달력 인스턴스 생성
let calendarInstance = new Calendar(targetCalendar, function (){
	let updatedCalendar = Calendar.get(this.monthPage)
	for(let loopPreCallback of this.preCallbacks)
		loopPreCallback(updatedCalendar)

	this.data = {}
	this.calendarDiv.innerHTML = ''

	for(let weekData of updatedCalendar.data){
		for(let dayData of weekData){
			let classData = ''

			if(!dayData.isCurrentMonth) classData += 'overday '

			// 술 먹었는지 여부
			let isRunnedDay = false

			// 디자인 테스트용 코드
			// if(dayData.number < 6 ) isRunnedDay = true

			// 이용자의 개인정보 반영
			let drinkMG = 0
			let moneyCount = 0
			let peopleCount = 1

			// drinkCount 는 mg 단위로 받아온 후
			// 현재 설정의 한 잔 mg로 나눠서 잔수로 변환합니다.
			let drinkCount = 0

			// 마신 횟수가 0보다 클때만 마신 날로 간주
			if(drinkCount > 0) isRunnedDay = true

			let targetDate = new Date(dayData.date)
			targetDate = targetDate.setDate(targetDate.getDate())
			let currentDateObj = new Date(targetDate)
			let lightData = getLightData(currentDateObj)
			let BMNT = `${lightData.moonRise}`
			let EENT = `${lightData.moonSet}`

			// 오늘 또는 안 먹은 날 또는 마신 날
			classData += (dayData.isToday) ? 'today ' : 'notrunnedday '

			// 일요일 색칠
			if(dayData.date.format('ddd') == 'Sun')
				classData += 'sunday '
			if(dayData.date.format('ddd') == 'Sat')
				classData += 'sat '

			let tempDiv = document.createElement('div')
			let dayNumber = String(dayData.number)
			if (dayNumber.length == 1) dayNumber = `0${dayNumber}`
			tempDiv.insertAdjacentHTML('beforeend',
				'<span class="' + classData + '">'
					+'<a class="day-present">' + dayNumber
					+	'<a class="day-info-1">' + BMNT + '</a>'
					+	'<a class="day-used-money">' + EENT + '</a>'
				+ '</a></span>')

			// {"name":"T","number":1,"month":5,
			// "isCurrentMonth":true,"isToday":false,
			// "date":"2018-04-30T15:00:00.000Z"}

			// 오늘 날짜 미리 선택시켜놓기
			if(dayData.isToday)
				for(let loopTodayCallback of this.todayCallbacks)
					loopTodayCallback(dayData, tempDiv)

			for(let loopCallback of this.callbacks)
				loopCallback(dayData, tempDiv)

			this.data[`${dayData.year}/${dayData.month}/${dayData.number}`] = tempDiv
			this.calendarDiv.insertAdjacentElement('beforeend', tempDiv)
		}
	}
})

export default function updateCalendar (){
	calendarInstance.update()
}

// 오늘 날짜에 맞춰서 미리 선택처리
let calendarTodayProcess = (dayData, tempDiv)=> {

	calendarInstance.activatedDay = {
		data: dayData,
		div: tempDiv.firstChild,
		beforeColor: window.getComputedStyle(tempDiv.firstChild).getPropertyValue('background')
	}

	// 날짜 반영 후 색상 변경
	tempDiv.firstChild.style.background = '#a55697'
	tempDiv.firstChild.style.borderColor = '#fff'
	tempDiv.firstChild.style.borderStyle = 'solid'
	tempDiv.firstChild.style.borderWidth = '3'
	tempDiv.firstChild.style.zIndex = '1'
}

// 현재 보여지고 있는 년월 정보를 출력
calendarInstance.preRegister((updatedCalendar)=>{
	currentMonth.text = updatedCalendar.date.format('YYYY년 M월')
	currentYear.text = `월출 월몰`
	
})

calendarInstance.register(calendarTodayProcess, true)

// 달력 이전 다음 확인에 따른 갱신기능 구현
monthPrevButton.addEventListener('click', ()=>{calendarInstance.prevMonthPage()})
monthNextButton.addEventListener('click', ()=>{calendarInstance.nextMonthPage()})
