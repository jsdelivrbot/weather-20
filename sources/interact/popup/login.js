import {PopupDisplayFinished} from '../popup.js'

let popupPannel = document.getElementById('popup')
let questionPannel = document.getElementById('login-question')

let menuAccountButton = document.getElementById('account-logo')
let loginOrLogoutButton = document.getElementById('login-question-login-or-logout')
let registerOrUnregisterButton = document.getElementById('login-question-register-or-unregister')

let isAlreadyListnerInstalled = false
let callback = null

let finisher = (selectedNumber) => {
	popupPannel.style.display = 'none'
	questionPannel.style.display = 'none'
	try{if(callback != null) callback(selectedNumber) } catch(e){}

	PopupDisplayFinished()
}

export function LoginProcess (){
	//console.log('did it works?')
}

export function LoginQuestionInit (){
	//console.log('did it init?')
	menuAccountButton.addEventListener('click', (event)=>{
		// 기본 로그인 처리
		LoginQuestion(LoginProcess)
	})
}

export function LoginQuestion (paramCallback) {
	if(!isAlreadyListnerInstalled) {
		isAlreadyListnerInstalled = true
		
		loginOrLogoutButton.addEventListener('click', (event)=>{
			finisher(null)
		})
	}

	callback = paramCallback
	popupPannel.style.display = 'block'
	questionPannel.style.display = 'block'
	window.armyWeather.util.applyColorTheme()
}