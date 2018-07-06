import {LoginQuestion, Finisher} from './login.js'
import {RegisterQuestion} from './register.js'
import {HeatQuestion} from './heat.js'


let menuAccountButton = document.getElementById('account-logo')
let isLogined = false

export function ReportSend (userId, userIp, userUUID, temp, time, cellNumber){
	// TODO
}

export function discomfortCalculate(temp1, wind){
	let t2 = Number(temp1)
	let v2 = Number(wind)
	let v3 = (9/5*t2)-(0.55*(1-v2/100)*(9/5*t2-26))+32
	return v3.substring(0,5)
}

export function ReportWriteInit (){
	menuAccountButton.addEventListener('click', (event)=>{

		// 온도지수계산기
		HeatQuestion((heatSituation, tempIndex, windChill)=>{

			console.log(`요청 끝남: ${heatSituation} ${tempIndex} ${windChill}`)
			// 온도 전파시
			if(heatSituation == 'report'){

				// 로그인 전이면 로그인 창 표시
				if(!isLogined){

					// 기본 로그인 처리
					LoginQuestion((situation)=>{

						switch(situation){
							case `login`:
								// 로그인 처리

								// TODO
								// 여기에 연동 추가

								break
							case `register`:
								// 양식 추가요청
								RegisterQuestion((situation)=>{

									console.log(`양식 추가요청끝남: ${situation}`)
									// 여기서 ID/PW 토큰 캐시에 저장
								})
								break
						}
					})
					return
				}

				// TODO
				// 온도 전파 함수 호출
				//ReportSend (userId, userIp, userUUID, temp, time, cellNumber)
			}
			
		})
	})
}