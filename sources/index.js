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

		// API 초기화
		import('./transmitter/api.js').then(paramModule => {
			let API = paramModule.default
			API.setDomain(window.armyWeather.private.apiPath)
			
			if(!window.armyWeather.private.logined){
				if(window.armyWeather.private.identy.uid !== null
				  && window.armyWeather.private.identy.upw !== null){

					// 로그인 확인
					API.call('/api/account/login',{
						id: window.armyWeather.private.identy.uid,
						pw:  window.armyWeather.private.identy.upw,
						peerId: window.armyWeather.private.identy.pid
					},(paramData)=>{

						try{
							if(paramData.isSuccess){
								window.armyWeather.private.logined = true
								if(typeof paramData['isOverPower'] != 'undefined')
									window.armyWeather.private.isOverPower = paramData['isOverPower']
								window.armyWeather.private.identy.cell = paramData.cell

								// 지역관리자 권한확인
								API.call('/api/authorize-check',{
									id: window.armyWeather.private.identy.uid,
									pw:  window.armyWeather.private.identy.upw,
									peerId: window.armyWeather.private.identy.pid,
									cell: window.armyWeather.private.identy.cell
								},(paramData)=>{
									if(paramData.isSuccess)
										window.armyWeather.private.isLocalPower = true
								})
							} else{
								// 아이디 말소
								window.armyWeather.private.identy.uid = null
								window.armyWeather.private.identy.upw = null
								window.armyWeather.private.identy.cell = null
								alert(`이전 회원가입 정보가 말소되었습니다.\n관리자에게 문의해보시거나\n정확한 값으로 다시 회원가입 요청해보세요.`)
							}
						}catch(e){
							console.log(e)
						}
					})
				}
			}
		})

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