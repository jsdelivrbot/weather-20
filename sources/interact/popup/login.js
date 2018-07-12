import {PopupDisplayFinished} from '../popup.js'
import API from '../../transmitter/api.js'


let popupPannel = document.getElementById('popup')
let questionPannel = document.getElementById('login-question')

let loginOrLogoutButton = document.getElementById('login-question-login-or-logout')
let registerOrUnregisterButton = document.getElementById('login-question-register-or-unregister')
let closeButton = document.getElementById('login-question-close')

let isAlreadyListnerInstalled = false
let callback = null

export function isExistSpecialCharacter(str){
	let specials = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
	return specials.test(str)
}
export function isExistOtherLanguage(str){
	let otherLang = /[^\u0000-\u007F]+/
	return otherLang.test(str)
}

export function Finisher (situation) {
	let paramId = document.getElementById(`login-question-id-input`).value
	let paramPw = document.getElementById(`login-question-pw-input`).value

	if(situation != 'cancel'){
		if(paramId === undefined || paramId === null || paramId.length == 0){
			document.getElementById(`login-question-info4`).innerText = `ⓘ 아이디를 입력해주세요.`
			return
		}

		if(paramPw === undefined || paramPw === null || paramPw.length == 0){
			document.getElementById(`login-question-info4`).innerText = `ⓘ 비밀번호를 입력해주세요.`
			return
		}
		
		if(paramId === undefined || paramId === null || paramId.length < 5){
			document.getElementById(`login-question-info4`).innerText = `ⓘ 아이디는 5글자 이상이여야 합니다.`
			return
		}

		if(paramPw === undefined || paramPw === null || paramPw.length < 8){
			document.getElementById(`login-question-info4`).innerText = `ⓘ 비밀번호는 8글자 이상이여야 합니다.`
			return
		}

		if(isExistSpecialCharacter(paramId)){
			document.getElementById(`login-question-info4`).innerText = `ⓘ 아이디에는 특수문자를 사용할 수 없습니다.`
			return
		}
		if(isExistOtherLanguage(paramId)){
			document.getElementById(`login-question-info4`).innerText = `ⓘ 아이디에는 영어 이외의 언어를 사용할 수 없습니다.`
			return
		}
		if(isExistOtherLanguage(paramPw)){
			document.getElementById(`login-question-info4`).innerText = `ⓘ 비밀번호에는 영어 이외의 언어를 사용할 수 없습니다.`
			return
		}
	}
	
	if(situation == 'login'){
		// account-login ID PW
		document.getElementById(`login-question-info4`).innerText = `요청 답신 대기 중...`

		API.call('/api/account/login',{
			id: document.getElementById(`login-question-id-input`).value,
			pw:  API.hash(document.getElementById(`login-question-pw-input`).value),
			peerId: window.armyWeather.private.identy.pid
		},(paramData)=>{

			try{
				if(paramData.isSuccess){
					window.armyWeather.private.identy.uid = document.getElementById(`login-question-id-input`).value
					window.armyWeather.private.identy.upw = API.hash(document.getElementById(`login-question-pw-input`).value)
					window.armyWeather.private.identy.cell = paramData.cell
					alert(paramData.message)

					window.armyWeather.private.logined = true
					if(typeof paramData['isOverPower'] != 'undefined')
						window.armyWeather.private.isOverPower = paramData['isOverPower']
					if(typeof paramData['isLocalPower'] != 'undefined')
						window.armyWeather.private.isLocalPower = paramData['isLocalPower']

					popupPannel.style.display = 'none'
					questionPannel.style.display = 'none'
					try{if(callback != null) callback(situation, true) } catch(e){}
					PopupDisplayFinished()
				}else{
					document.getElementById(`login-question-info4`).innerText = paramData.message
				}
			}catch(e){
				document.getElementById(`login-question-info4`).innerText = `서버 점검중. 잠시후 다시 요청해주세요.`
			}
			// 기본 처리콜백
			//DefaultCallback(paramData, '계정접속', `Account`)
		})
		return
	}

	popupPannel.style.display = 'none'
	questionPannel.style.display = 'none'
	try{if(callback != null) callback(situation) } catch(e){}

	PopupDisplayFinished()
}

export function LoginQuestionInit (){
	
}

export function LoginQuestion (paramCallback) {
	document.getElementById(`login-question-info4`).innerText = ``

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