import {LocalWeatherRedraw} from './weather/local-weather.js'
import { MenuHook } from './menu.js'

export default () => {
	MenuHook('health', ()=>{
		LocalWeatherRedraw()
	})
}