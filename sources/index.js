// 필수 기능 초기화
import {UtilPreInit, UtilInit} from './interact/util.js'
import { MenuInit } from './interact/menu.js'
import { PopupInit } from './interact/popup.js'

//import { WeatherInit } from './interact/weather.js'
//import { LifeInit } from './interact/life.js'
//import { HealthInit } from './interact/health.js'

UtilPreInit()

let readyToLoad = setInterval(() => {
	if (document.readyState === 'complete') {
		clearInterval(readyToLoad)

		// 부가기능 초기화
		UtilInit()

		// 상호작용 초기화
		import('./interact/weather.js').then(paramModule => {
			let WeatherInit = paramModule.default
			WeatherInit()
		})

		import('./interact/life.js').then(paramModule => {
			let LifeInit = paramModule.default
			LifeInit()
		})

		import('./interact/health.js').then(paramModule => {
			let HealthInit = paramModule.default
			HealthInit()
		})

		// 팝업 초기화
		PopupInit()
		MenuInit()
	}
}, 10)