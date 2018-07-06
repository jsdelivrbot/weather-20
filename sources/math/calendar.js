import moment from 'moment'

class Calendar{
	constructor(paramCalendarDiv, updateCallback) {
		this.calendarDiv = paramCalendarDiv
		this.monthPage = 0
		this.activatedDay = null
		
		this.callbacks = []
		this.todayCallbacks = []
		this.preCallbacks = []

		this.data = {}
		this.update = updateCallback
	}

	change(updateCallback){
		this.update = updateCallback
	}
	
	// 계산된 현재 달력정보에 최초로 접근하는 콜백들
	preRegister(paramPreCallback){
		this.preCallbacks.push(paramPreCallback)
	}
	
	register(paramCallback, isOnlyWorkOnInToday){
		if(isOnlyWorkOnInToday)
			this.todayCallbacks.push(paramCallback)
		else
			this.callbacks.push(paramCallback)
	}

	prevMonthPage() {
		--this.monthPage
		this.update()
	}

	nextMonthPage() {
		++this.monthPage
		this.update()
	}
	
	static get(addMonth, date) {
		let innerDate = date
		if(innerDate == undefined) innerDate = moment()
		if(addMonth == undefined) addMonth = 0
		
		innerDate.month(innerDate.month() + addMonth)
		
		let calendarFirstDay = Calendar.getWeeksFirstDay(Calendar.getCalendarFirstDay(innerDate))
		return {
			data: Calendar.buildMonth( calendarFirstDay, innerDate),
			date: innerDate
		}
	}
	
	static getCalendarFirstDay (date) {
		let innerDate = date.clone()
		return innerDate.date(1).day(0)
	}
	
	static getWeeksFirstDay (date) {
		let innerDate = date.clone()
		return innerDate.day(0).hour(0).minute(0).second(0).millisecond(0)
	}

	static buildMonth (currentTime, currentMonth) {
		let weeks = []
		let done = false

		let date = currentTime.clone()
		let monthIndex = date.month()
		let count = 0

		while (!done) {
			weeks.push( this.buildWeek(date.clone(), currentMonth) )
			date.add(1, 'w') // 다음 주로 이동
			done = count++ > 2 && monthIndex !== date.month() // 달이 넘어 가면 멈춤
			monthIndex = date.month()
		}

		return weeks
	}

	// 한주의 첫번째 날과 달의 정보를 받음
	static buildWeek (date, currentMonth) {
		let days = [] // 총 7일의 정보가 들어감
		for (let i = 0; i < 7; i++) {
			days.push({
				// 요일[S-M-T-W]정보
				name: date.format('dd').substring(0, 1),
				
				// 일[0-1-2-3]정보
				number: date.date(),
				
				// 월 정보[1~12]
				month: date.month()+1,
				
				// 년 정보
				year: date.year(),
				
				// 현재 월인지
				isCurrentMonth: date.month() === currentMonth.month(),
				
				// 오늘인지
				isToday: date.isSame(new Date(), 'day'),
				
				// 실제 모멘트 오브젝트
				date: date
			})
			date = date.clone()
			date.add(1, 'd')
		}
		return days
	}
}

export default Calendar