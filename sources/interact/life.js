import {updateCalendar} from './life/calendar.js'
import { MenuHook } from './menu.js'
import { AddressInit } from './life/address.js'

export default() => {
	updateCalendar()
	AddressInit()

	MenuHook('life', ()=>{
		updateCalendar()
	})
}