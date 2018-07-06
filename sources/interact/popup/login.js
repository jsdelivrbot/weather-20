import {PopupDisplayFinished} from '../popup.js'

let popupPannel = document.getElementById('popup')
let questionPannel = document.getElementById('login-question')

let loginOrLogoutButton = document.getElementById('login-question-login-or-logout')
let registerOrUnregisterButton = document.getElementById('login-question-register-or-unregister')
let closeButton = document.getElementById('login-question-close')

let isAlreadyListnerInstalled = false
let callback = null

export function Finisher (situation) {
	popupPannel.style.display = 'none'
	questionPannel.style.display = 'none'
	try{if(callback != null) callback(situation) } catch(e){}

	PopupDisplayFinished()
}

export function LoginQuestionInit (){
	
}

export function LoginQuestion (paramCallback) {
	if(!isAlreadyListnerInstalled) {
		isAlreadyListnerInstalled = true

		closeButton.addEventListener('click', (event)=>{
			// 로그인 진행
			Finisher(`cancel`)
		})
		loginOrLogoutButton.addEventListener('click', (event)=>{
			// 로그인 진행
			Finisher(`login`)
		})
		registerOrUnregisterButton.addEventListener('click', (event)=>{
			// 회원가입 진행
			Finisher(`register`)
		})
		 
	}

	callback = paramCallback
	popupPannel.style.display = 'block'
	questionPannel.style.display = 'block'
	window.armyWeather.util.applyColorTheme()
}