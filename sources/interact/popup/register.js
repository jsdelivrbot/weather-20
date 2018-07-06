import {PopupDisplayFinished} from '../popup.js'

let popupPannel = document.getElementById('popup')
let questionPannel = document.getElementById('register-question')

let loginOrLogoutButton = document.getElementById('register-question-register-or-unregister-info1')
let registerOrUnregisterButton = document.getElementById('register-question-register-or-unregister')

let isAlreadyListnerInstalled = false
let callback = null

let Finisher = (situation) => {
	popupPannel.style.display = 'none'
	questionPannel.style.display = 'none'
	try{if(callback != null) callback(situation) } catch(e){}

	PopupDisplayFinished()
}

export function RegisterQuestionInit (){
	
}

export function RegisterQuestion (paramCallback) {
	if(!isAlreadyListnerInstalled) {
		isAlreadyListnerInstalled = true

		let cancelProcess = (event)=>{
			// 회원가입 진행
			Finisher(`cancel`)
		}

		// 취소버튼 모음
		document.getElementById(`register-question-close`).addEventListener('click', cancelProcess)
		document.getElementById(`register-question-login-or-logout`).addEventListener('click', cancelProcess)
	}

	callback = paramCallback
	popupPannel.style.display = 'block'
	questionPannel.style.display = 'block'
	window.armyWeather.util.applyColorTheme()
}