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
		main: '#000000ad',
		sub: '#515c63',
		border: 'rgba(78, 78, 78, 0.68)',
		fill: 'rgb(81, 92, 99)',
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
var manageQuestion = null

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
	effects.weatherFlick = new Flick('weather-flick', ['#89d2e891', '#b3b3b3b0'])
	effects.lifeFlick = new Flick('life-flick', ['#89d2e891', '#b3b3b3b0'])
	effects.healthFlick = new Flick('health-flick', ['#89d2e891', '#b3b3b3b0'])
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
	manageQuestion = document.getElementById('manage-question')
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
	let isActivatedRegisterQuestion = false
	let isActivatedHeatQuestion = false
	let isActivatedAddressQuestion = false
	let isActivatedManageQuestion = false

	// 활성화 된 메뉴 가져오기
	selectedItem = document.querySelector('.menu-item-selected')
	menuBars = document.querySelectorAll('#menu-bar > div')
	menuItems = document.querySelectorAll('.menu-item')

	try {
		isActivatedLoginQuestion =
			window.getComputedStyle(document.getElementById('login-question')).display != 'none'
	}catch(e) {}

	try {
		isActivatedRegisterQuestion =
			window.getComputedStyle(document.getElementById('register-question')).display != 'none'
	}catch(e) {}

	try {
		isActivatedHeatQuestion =
			window.getComputedStyle(document.getElementById('heat-question')).display != 'none'
	}catch(e) {}

	try {
		isActivatedAddressQuestion =
			window.getComputedStyle(addressQuestion).display != 'none'
	}catch(e) {}
	try {
		isActivatedManageQuestion =
			window.getComputedStyle(manageQuestion).display != 'none'
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
		selectedItem.style.background = 'rgba(78, 78, 78, 0.68)'
	}

	for(let menuBar of menuBars)
		if(menuBar != null) menuBar.style['border-color'] = '#fff'//mainColor

	for(let menuItem of menuItems){
		if(menuItem != null) menuItem.style.color = mainColor
		if(menuItem != null) menuItem.style.background = backgroundColor
	}

	if(isActivatedLoginQuestion){
		document.getElementById('login-question').style.background = subColor
		document.getElementById('login-question-login-or-logout').style.borderColor = mainColor
		document.getElementById('login-question-register-or-unregister').style.borderColor = mainColor
		document.getElementById('login-question-register-or-unregister-info1').style.color = mainColor
		document.getElementById('login-question-login-or-logout-info1').style.color = mainColor
		
		document.getElementById('login-question-id-input').style.color = mainColor
		document.getElementById('login-question-pw-input').style.color = mainColor
	}
	if(isActivatedRegisterQuestion){
		document.getElementById('register-question').style.background = subColor
		//register-question-name-input
		document.getElementById('register-question-login-or-logout').style.borderColor = mainColor
		document.getElementById('register-question-register-or-unregister').style.borderColor = mainColor
		document.getElementById('register-question-register-or-unregister-info1').style.color = mainColor
		document.getElementById('register-question-login-or-logout-info1').style.color = mainColor
		
		document.getElementById('register-question-area-input').style.borderColor = mainColor
		document.getElementById('register-question-area-input').style.color = mainColor
		document.getElementById('register-question-name-input').style.borderColor = mainColor
		document.getElementById('register-question-name-input').style.color = mainColor
		document.getElementById('register-question-addr-input').style.borderColor = mainColor
		document.getElementById('register-question-addr-input').style.color = mainColor
		document.getElementById('register-question-phone-input').style.borderColor = mainColor
		document.getElementById('register-question-phone-input').style.color = mainColor
	}
	
	if(isActivatedHeatQuestion){
		document.getElementById('heat-question').style.background = subColor
		document.getElementById('heat-question-login-or-logout').style.borderColor = mainColor
		document.getElementById('heat-question-register-or-unregister').style.borderColor = mainColor

		document.getElementById('heat-question-name-input').style.borderColor = mainColor
		document.getElementById('heat-question-name-input').style.color = fillColor
		document.getElementById('heat-question-addr-input').style.borderColor = mainColor
		document.getElementById('heat-question-addr-input').style.color = fillColor
		document.getElementById('heat-question-phone-input').style.borderColor = mainColor
		document.getElementById('heat-question-phone-input').style.color = fillColor
		document.getElementById('heat-question-temp-input').style.borderColor = mainColor
		document.getElementById('heat-question-temp-input').style.color = fillColor

		document.getElementById('heat-question-rtemp1-input').style.color = fillColor
		document.getElementById('heat-question-rtemp2-input').style.color = fillColor
		document.getElementById('heat-question-rtemp3-input').style.color = fillColor
	}

	if(isActivatedAddressQuestion){
		addressQuestion.style.background = subColor
	}
	if(isActivatedManageQuestion){
		manageQuestion.style.background = subColor
	}
}