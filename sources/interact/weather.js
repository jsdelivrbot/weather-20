import {CoordInit} from './weather/coord.js'
import {LocalWeatherInit, LocalWeatherRedraw} from './weather/local-weather.js'
import { MenuHook } from './menu.js'


export default () => {
	CoordInit()
	LocalWeatherInit()

	MenuHook('weather', ()=>{
		LocalWeatherRedraw()
	})
}