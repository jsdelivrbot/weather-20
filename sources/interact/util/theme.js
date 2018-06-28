import {getPage} from '../menu.js'

/*
 * 특수효과 구현부
 */
import Flick from '../../math/flick.js'

var effects = {
	flick: null
}

var colorTheme = {
	cloud: {
		main: '#0c4358',
		sub: '#0c4358',
		border: '#0c4358',
		fill: '#0c4358',
		background: '#FFFFFF'
	},
	aqua: {
		main: '#1ACDEA',
		sub: '#2FDEF5',
		border: '#24D7F2',
		fill: '#06B8D4',
		background: '#FFFFFF'
	},
	pink: {
		main: '#EA5958',
		sub: '#FF7A7A',
		border: '#FF7A7A',
		fill: '#E85858',
		background: '#FFFFFF'
	},
	yello: {
		main: '#F2BD77',
		sub: '#FFD69C',
		border: '#E8b776',
		fill: '#f7D19c',
		background: '#FFFFFF'
	}
}

// 평소 숨겨진 상태의 SVG 요소들은
// 로딩시간이 제각각 다르므로 마지막으로
// 적용되었던 테마 정보를 알아서 가져가게 해야함
var lastAppliedTheme = null


// 엘레먼트 모음
var menuLogoInfo = null
var menuAccountInfo = null

var loginQuestion = null
var loginOrLogoutButton = null
var loginOrLogoutButtonInfo1 = null
var registerOrUnregisterButton = null
var registerOrUnregisterButtonInfo1 = null
var loginIdInput = null
var loginPwInput = null

var addressQuestion = null

var selectedItem = null
var menuBars = null
var menuItems = null

export function ThemePreInit (){

	// iOS 멀티터치 줌 방지용
	document.documentElement.addEventListener('touchstart', (event) =>{
		if (event.touches.length > 1) { event.preventDefault() }

		// iOS rubberband scrolling 방지용
		// TODO 아마 미작동하고 있는 것으로 보임
		 if( this.scrollTop === 0 ) {
			this.scrollTop += 1
		} else if( this.scrollTop + this.offsetHeight >= this.scrollHeight ) {
			this.scrollTop -= 1
		}
	}, false)

	// 튕김 효과 생성
	effects.weatherFlick = new Flick('weather-flick', ['#ADCADD', '#FFFFFF'])
	effects.lifeFlick = new Flick('life-flick', ['#ADCADD', '#FFFFFF'])
	effects.healthFlick = new Flick('health-flick', ['#ADCADD', '#FFFFFF'])
}

export function ThemeInit(){
	menuLogoInfo = document.getElementById('menu-logo-info')
	menuAccountInfo = document.getElementById('menu-account-info')
	
	loginQuestion = document.getElementById('login-question')
	loginOrLogoutButton = document.getElementById('login-question-login-or-logout')
	loginOrLogoutButtonInfo1 = document.getElementById('login-question-register-or-unregister-info1')
	registerOrUnregisterButton = document.getElementById('login-question-register-or-unregister')
	registerOrUnregisterButtonInfo1 = document.getElementById('login-question-login-or-logout-info1')
	loginIdInput = document.getElementById('login-question-id-input')
	loginPwInput = document.getElementById('login-question-pw-input')
	
	addressQuestion = document.getElementById('address-question')
}


// 특수효과 해상도 갱신용 (최적화용)
export function refreshEffect(){
	//
}

// 특수효과 전부 멈춤용 (최적화용)
export function reloadEffect(){
	effects.weatherFlick.pause()
	effects.lifeFlick.pause()
	effects.healthFlick.pause()
}

// 특수효과 접근용
export function getEffects(){
	return effects
}

// 테마적용 함수 구현
export function applyColorTheme (color, custom){
	let isActivatedLoginQuestion = false
	let isActivatedAddressQuestion = false

	// 활성화 된 메뉴 가져오기
	selectedItem = document.querySelector('.menu-item-selected')
	menuBars = document.querySelectorAll('#menu-bar > div')
	menuItems = document.querySelectorAll('.menu-item')

	try {
		isActivatedLoginQuestion =
			window.getComputedStyle(loginQuestion).display != 'none'
	}catch(e) {}
	try {
		isActivatedAddressQuestion =
			window.getComputedStyle(addressQuestion).display != 'none'
	}catch(e) {}

	
	let mainColor = null
	let subColor = null
	let borderColor = null
	let fillColor = null
	let backgroundColor = null

	if(color != null) {

		// 현재 테마 색상정보 불러오기
		mainColor = colorTheme[color].main
		subColor = colorTheme[color].sub
		borderColor = colorTheme[color].border
		fillColor = colorTheme[color].fill
		backgroundColor = colorTheme[color].background

		lastAppliedTheme = colorTheme[color]
	}else if(custom != null) {

		// 커스텀 테마 색상정보 불러오기
		mainColor = custom.main
		subColor = custom.sub
		borderColor = custom.border
		fillColor = custom.fill
		backgroundColor = custom.background

		lastAppliedTheme = custom
	}else if(lastAppliedTheme != null) {

		// 마지막으로 사용한 테마 색상정보 불러오기
		mainColor = lastAppliedTheme.main
		subColor = lastAppliedTheme.sub
		borderColor = lastAppliedTheme.border
		fillColor = lastAppliedTheme.fill
		backgroundColor = lastAppliedTheme.background
	}

	if(mainColor === null || subColor === null ||
	   borderColor === null || fillColor === null || backgroundColor === null)return

	//로고 글씨 색상 변경
	//if(menuLogoInfo != null){
		//menuLogoInfo.style.color = mainColor
		//menuAccountInfo.style.color = mainColor
	//}
	// 메뉴 색상 변경
	if(selectedItem != null){
		selectedItem.style.color = backgroundColor
		selectedItem.style.background = mainColor
	}

	for(let menuBar of menuBars)
		if(menuBar != null) menuBar.style['border-color'] = '#fff'//mainColor

	for(let menuItem of menuItems){
		if(menuItem != null) menuItem.style.color = mainColor
		if(menuItem != null) menuItem.style.background = backgroundColor
	}

	if(isActivatedLoginQuestion){
		loginQuestion.style.background = mainColor
		loginOrLogoutButton.style.borderColor = mainColor
		registerOrUnregisterButton.style.borderColor = mainColor
		loginOrLogoutButtonInfo1.style.color = mainColor
		registerOrUnregisterButtonInfo1.style.color = mainColor
		
		loginIdInput.style.color = mainColor
		loginPwInput.style.color = mainColor
	}
	
	if(isActivatedAddressQuestion){
		addressQuestion.style.background = mainColor
	}
}