import updateBMNT from './bmnt-calendar.js'
import updateSUN from './sun-calendar.js'
import updateMOON from './moon-calendar.js'
import updateMAIN from './main-calendar.js'

let calendarSlider = null
export function updateCalendar (){
	updateMAIN()
	updateBMNT()
	updateSUN()
	updateMOON()
	
	if(calendarSlider !== null)
		calendarSlider.destroy()

	calendarSlider = new Swiper('.calendar-info-slider', {
		slidesPerView: 'auto',
		centeredSlides: false,
		grabCursor: true,
		pagination: {
			el: '.swiper-pagination'
		},
		on: {
			slideChange: ()=>{
				//console.log(`달력 슬라이드 넘김감지: ${calendarSlider.activeIndex}`)
			}
		}
	})
}