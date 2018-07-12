import {LoginQuestion, Finisher} from './login.js'
import {RegisterQuestion} from './register.js'
import {HeatQuestion} from './heat.js'
import {LocalWeatherUpdate} from '../weather/local-weather.js'
import API from '../../transmitter/api.js'

let menuAccountButton = document.getElementById('account-logo')
let isLogined = false

// DOM 인풋 처리용
export function inputNumberConst(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57) && evt.key != '.')
        return false
    try{
    	var inputStr = evt.path[0].value
      if(isNaN(inputStr) || inputStr ==''){
			evt.path[0].value = ''
      }
    }catch(e){}
    return true
}

export function inputNumberConst_Custom(evt, min, max){
    var charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57) && evt.key != '.')
        return false
    try{
    	var inputStr = evt.path[0].value
      if(isNaN(inputStr) || inputStr ==''){
			evt.path[0].value = null
      }else{
		  let value = Number(inputStr)
		  if(value < min || value > max){
			alert(`잘못된 값입니다.`)
			evt.path[0].value = null
		  }
	  }
    }catch(e){}
    return true
}

export function discomfortCalculate(temp1, wind){
	let t2 = Number(temp1)
	let v2 = Number(wind)
	let v3 = (9/5*t2)-(0.55*(1-v2/100)*(9/5*t2-26))+32
	return v3.substring(0,5)
}

var alarmSwitch = document.getElementById(`alarm-switch`)
export function alarmDisplayUpdate(){
	if(window.armyWeather.private.isAlarm){
		alarmSwitch.style.backgroundColor = `#297684`
		alarmSwitch.children[0].src = `resources/icons/alarm.png`
		alarmSwitch.children[1].src = `resources/icons/alarm.png`
		alarmSwitch.children[3].innerText = `알람켜짐`
	}else{
		alarmSwitch.style.backgroundColor = `#515c63`
		alarmSwitch.children[0].src = `resources/icons/alarm_off.png`
		alarmSwitch.children[1].src = `resources/icons/alarm_off.png`
		alarmSwitch.children[3].innerText = `알람꺼짐`
	}
}

export function ReportWriteInit (){

	// DOM 입력칸 숫자이외 입력 방지코드
	/*
	//document.getElementById('heat-question-phone-input').onkeyup = inputNumberConst
	document.getElementById('heat-question-phone-input').onchange = (evt)=>{inputNumberConst_Custom(evt, 15, 40)}

	//document.getElementById('heat-question-name-input').onkeyup = inputNumberConst
	document.getElementById('heat-question-name-input').onchange = (evt)=>{inputNumberConst_Custom(evt, 5, 35)}

	//document.getElementById('heat-question-addr-input').onkeyup = inputNumberConst
	document.getElementById('heat-question-addr-input').onchange = (evt)=>{inputNumberConst_Custom(evt, 25, 50)}

	document.getElementById('heat-question-temp-input').onkeyup = inputNumberConst

	// 기온
	//document.getElementById('heat-question-rtemp1-input').onkeyup = inputNumberConst
	document.getElementById('heat-question-rtemp1-input').onchange = (evt)=>{inputNumberConst_Custom(evt, -30, 10)}
	//document.getElementById('heat-question-rtemp2-input').onkeyup = inputNumberConst
	document.getElementById('heat-question-rtemp2-input').onchange = (evt)=>{inputNumberConst_Custom(evt, 0, 10)}

	document.getElementById('heat-question-rtemp3-input').onkeyup = inputNumberConst
	*/

	
	alarmSwitch.addEventListener('click', (event)=>{
		// 알람유형 반전
		window.armyWeather.private.isAlarm = !window.armyWeather.private.isAlarm
		alarmDisplayUpdate()
	})
	
	menuAccountButton.addEventListener('click', (event)=>{
		alarmDisplayUpdate()

		// 온도지수계산기
		HeatQuestion((heatSituation, tempIndex, windChill)=>{

			// 온도 전파시
			if(heatSituation == 'report'){

				// 로그인 전이면 로그인 창 표시
				if(!window.armyWeather.private.logined){

					// 기본 로그인 처리
					LoginQuestion((situation, isSuccess)=>{

						switch(situation){
							case `login`:
								if(isSuccess) window.armyWeather.private.logined = true

								break
							case `register`:
								// 양식 추가요청
								RegisterQuestion((situation)=>{})
								break
						}
					})
					return
				}

				// 지역관리자는 허용받은 지역만 수정할 수 있으므로
				// 어느 페이지를 보고있던 허용받은 곳으로 정보를 반영
				let targetCell = window.armyWeather.private.identy.cell

				// 최고관리자는 그냥 보고있는 셀을 수정
				if(window.armyWeather.private.isOverPower)
					targetCell = window.armyWeather.private.address.main.cell

				API.call('/api/authorize-check',{
					id: window.armyWeather.private.identy.uid,
					pw:  window.armyWeather.private.identy.upw,
					peerId: window.armyWeather.private.identy.pid,
					cell: targetCell
				},(paramData)=>{
					if(paramData.isSuccess){
						let preAreaData = window.armyWeather.private.localAreaData

						preAreaData.data.data.realTemp = windChill
						preAreaData.data.data.tempIndex = tempIndex
						preAreaData.data.data.reportedTime = Number(new Date())

						API.call('/api/areadata-update',{
							id: window.armyWeather.private.identy.uid,
							pw: window.armyWeather.private.identy.upw,
							peerId: window.armyWeather.private.identy.pid,
							cell: targetCell,
							data: preAreaData.data.data
						},(paramDatas)=>{
							if(paramDatas.isSuccess){
								LocalWeatherUpdate(()=>{
									alert(paramDatas.message)
								})
							}else{
								alert(paramDatas.message)
							}
						})
					}
					// 로그인 정보
					// alert(paramData.message)
				})
			}
			
		})
	})
}