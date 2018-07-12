import {PopupDisplayFinished} from '../popup.js'

let popupPannel = document.getElementById('popup')
let questionPannel = document.getElementById('heat-question')

let loginOrLogoutButton = document.getElementById('heat-question-register-or-unregister-info1')
let registerOrUnregisterButton = document.getElementById('heat-question-register-or-unregister')

let isAlreadyListnerInstalled = false
let callback = null

let Finisher = (situation, tempIndex, windChill) => {
	PopupDisplayFinished()

	popupPannel.style.display = 'none'
	questionPannel.style.display = 'none'
	try{if(callback != null) callback(situation, tempIndex, windChill) } catch(e){}
}

function toFixedRound( num, precision ) {
	return (+(Math.round(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision);
}

export function HeatQuestionInit (){
	questionPannel.style.display = 'none'
}

export function HeatCalculate(){
	// 온도지수 코드
	let param1 = Number(document.getElementById(`heat-question-name-input`).value) // 습구
	let param2 = Number(document.getElementById(`heat-question-addr-input`).value) // 흑구
	let param3 = Number(document.getElementById(`heat-question-phone-input`).value) // 건구

	if(isNaN(param1)) param1 = 0
	if(isNaN(param2)) param2 = 0
	if(isNaN(param3)) param3 = 0

	/*
	  습구온도 * 0.7
	+ 흑구온도 * 0.2
	+ 건구온도 * 0.1
	= 다 더하면 온도지수
	 */
	
	let isHeatWrong = false
	// 건구 범위가 안 맞으면
	if(isNaN(param3) || param3 < 15 || param3 > 40){
		isHeatWrong = true
		document.getElementById(`heat-question-phone-input`).value = ``
	}

	// 습구 범위가 안 맞으면
	if(isNaN(param1) || param1 < 5 || param1 > 35){
		isHeatWrong = true
		document.getElementById(`heat-question-name-input`).value = ``
	}

	// 흑구 범위가 안 맞으면
	if(isNaN(param2) ||param2 < 25 || param2 > 50){
		isHeatWrong = true
		document.getElementById(`heat-question-addr-input`).value = ``
	}
	
	if(isHeatWrong){
		document.getElementById(`heat-question-temp-input`).value = ``
	}else{
		document.getElementById(`heat-question-temp-input`).value = toFixedRound(Number( (0.7*param1) + (0.2*param2) + (0.1*param3)), 2)
	}

	// 체감온도 계산코드
	let isFeelWrong = false
	let param5 = Number(document.getElementById(`heat-question-rtemp1-input`).value) // 기온

	// 기온 범위가 안 맞으면
	if(isNaN(param5) ||param5 < -30 || param5 > 10){
		isFeelWrong = true
		document.getElementById(`heat-question-rtemp1-input`).value = ``
	}

	let param6 = Number(document.getElementById(`heat-question-rtemp2-input`).value) // 바람

	// 바람 범위가 안 맞으면
	if(isNaN(param6) ||param6 < 0 || param6 > 20){
		isFeelWrong = true
		document.getElementById(`heat-question-rtemp2-input`).value = ``
	}
	
	if(isFeelWrong){
		document.getElementById(`heat-question-rtemp3-input`).value = ``
	}else{
		document.getElementById(`heat-question-rtemp3-input`).value = toFixedRound(realTemp(param5, param6), 1)
	}
}

export function realTemp(paramTemp, paramWind) {
	let ta = parseFloat(paramTemp)
	let ws = parseFloat(paramWind)
	let rs = getNewWCT(ta, ws)
	return Math.round(rs)
}

export function getNewWCT(Tdum,Wdum) {
	let T = Tdum;
	let W = Wdum*3.6
	let result = 0.0
	if ( W > 4.8 ) {
			W = Math.pow(W,0.16)
			result = 13.12 + 0.6215 * T - 11.37 * W + 0.3965 * W * T
			if(result > T) {
				result = T
			}
	}
	else {
		result = T
	}
	return result
}

export function HeatQuestion (paramCallback) {
	if(!isAlreadyListnerInstalled) {
		isAlreadyListnerInstalled = true
		
		// 자동 계산 갱신
		document.getElementById('heat-question-phone-input').onchange = HeatCalculate
		document.getElementById('heat-question-name-input').onchange = HeatCalculate
		document.getElementById('heat-question-addr-input').onchange = HeatCalculate
		document.getElementById('heat-question-temp-input').onchange = HeatCalculate
		document.getElementById('heat-question-rtemp1-input').onchange = HeatCalculate
		document.getElementById('heat-question-rtemp2-input').onchange = HeatCalculate
		document.getElementById('heat-question-rtemp3-input').onchange = HeatCalculate

		document.getElementById(`heat-question-close`).addEventListener('click', (event)=>{
			// 닫기 진행
			Finisher(`cancel`, 0 , 0)
		})

		document.getElementById(`heat-question-login-or-logout`).addEventListener('click', (event)=>{
			// 계산 후 보고 진행
			HeatCalculate()

			let a1 = Number(document.getElementById(`heat-question-temp-input`).value) // 온도지수
			let a2 = Number(document.getElementById(`heat-question-rtemp3-input`).value) // 체감온도
			Finisher(`report`, a1, a2)
		})

		/*
		 * 값 초기화 구현
		 */
		document.getElementById(`heat-question-register-or-unregister`).addEventListener('click', ()=>{
			document.getElementById('heat-question-phone-input').value = null
			document.getElementById('heat-question-name-input').value = null
			document.getElementById('heat-question-addr-input').value = null
			document.getElementById('heat-question-temp-input').value = '0.00'
			document.getElementById('heat-question-rtemp1-input').value = null
			document.getElementById('heat-question-rtemp2-input').value = null
			document.getElementById('heat-question-rtemp3-input').value = '0.0'
		})
	}

	callback = paramCallback
	popupPannel.style.display = 'block'
	questionPannel.style.display = 'block'
	window.armyWeather.util.applyColorTheme()
}