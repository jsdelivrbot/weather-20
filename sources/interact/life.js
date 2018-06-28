import {updateCalendar} from './life/calendar.js'
import { MenuHook } from './menu.js'

export default() => {
	updateCalendar()

	MenuHook('life', ()=>{
		updateCalendar()
	})
}