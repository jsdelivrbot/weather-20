import {PopupDisplayFinished} from '../popup.js'
import {AddressQuestion} from './address.js'
import API from '../../transmitter/api.js'

let popupPannel = document.getElementById('popup')
let questionPannel = document.getElementById('register-question')

let loginOrLogoutButton = document.getElementById('register-question-register-or-unregister-info1')
let registerOrUnregisterButton = document.getElementById('register-question-register-or-unregister')

let isAlreadyListnerInstalled = false
let callback = null
let selectedControlArea = null

let Finisher = (situation) => {
	popupPannel.style.display = 'none'
	questionPannel.style.display = 'none'
	try{if(callback != null) callback(situation) } catch(e){}

	PopupDisplayFinished()
}

export function RegisterQuestionInit (){
}

export function RegisterQuestion (paramCallback) {
	let questionInfo = document.getElementById(`register-question-info4`)
	let areaInput = document.getElementById(`register-question-area-input`)

	questionInfo.innerText = `터치시 권한 요청할 지역선택 가능`
	questionInfo.innerText = ``
	selectedControlArea = null

	if(!isAlreadyListnerInstalled) {
		isAlreadyListnerInstalled = true

		let cancelProcess = (event)=>{
			// 회원가입 진행
			Finisher(`cancel`)
		}

		areaInput.addEventListener('click', ()=>{

			// 관리지역 선택 진행
			AddressQuestion((addressName, paramDatas, currentSelected, currentSelectedIndexNum)=>{
				let selectedAddressFullName = currentSelected.split('.').join(' ')
				// 풀주소명 파싱만 실패한 경우 그냥 좌표출력
				if(selectedAddressFullName.length == 0){
					selectedAddressFullName = `${addressName} ${paramDatas.data[2]} ${paramDatas.data[1]}`
				}
				selectedControlArea = {
					cellNumber: paramDatas.data[0],
					cellName: addressName,
					long: paramDatas.data[1],
					lat: paramDatas.data[2]
				}

				areaInput.innerText = selectedAddressFullName
				popupPannel.style.display = 'block'
				questionPannel.style.display = 'block'
				window.armyWeather.util.applyColorTheme()
			})
		})

		// 회원가입 신청 진행
		document.getElementById(`register-question-register-or-unregister`).addEventListener('click', ()=>{

			if(selectedControlArea === null || selectedControlArea === undefined){
				questionInfo.innerText = `ⓘ 관리할 지역을 선택해주세요.`
				return
			}
			
			let paramName = document.getElementById(`register-question-name-input`).value
			if(paramName === null || paramName === undefined || paramName.length == 0){
				questionInfo.innerText = `ⓘ 이름을 입력해주세요.`
				return
			}

			let paramCompany = document.getElementById(`register-question-addr-input`).value
			if(paramCompany === null || paramCompany === undefined || paramCompany.length == 0){
				questionInfo.innerText = `ⓘ 근무지를 입력해주세요.`
				return
			}

			let paramContact = document.getElementById(`register-question-phone-input`).value
			if(paramContact === null || paramContact === undefined || paramContact.length == 0){
				questionInfo.innerText = `ⓘ 연락처를 입력해주세요.`
				return
			}

			// TODO 가입진행
			questionInfo.innerText = `가입요청 진행 중...`
			API.call('/api/account/register', {
				// 아래부터 공개 데이터
				id: document.getElementById(`login-question-id-input`).value,
				nickName: document.getElementById(`register-question-name-input`).value,
				realName: document.getElementById(`register-question-name-input`).value,
				introduce:'',

				// 아래부터 비공개 데이터
				pw: API.hash(document.getElementById(`login-question-pw-input`).value),
				peerId: window.armyWeather.private.identy.pid,
				selectedControlArea,
				workLocation: document.getElementById(`register-question-addr-input`).value,
				contactNumber: document.getElementById(`register-question-phone-input`).value,

				// 내부 데이터
				logined: {},
			},(paramData)=>{

				// 기본 처리콜백
				if(paramData.isSuccess){
					window.armyWeather.private.identy.uid = document.getElementById(`login-question-id-input`).value
					window.armyWeather.private.identy.upw = API.hash(document.getElementById(`login-question-pw-input`).value)
					window.armyWeather.private.identy.cell = selectedControlArea.cellNumber
					window.armyWeather.private.isOverPower = paramData.isOverPower
					// op도 확인
					window.armyWeather.private.logined = true

					alert(paramData.message)
					Finisher(`cancel`)

				}else{
					document.getElementById(`register-question-info4`).innerText = paramData.message
				}
			})
		})

		// 취소버튼 모음
		document.getElementById(`register-question-close`).addEventListener('click', cancelProcess)
		document.getElementById(`register-question-login-or-logout`).addEventListener('click', cancelProcess)
	}

	callback = paramCallback
	popupPannel.style.display = 'block'
	questionPannel.style.display = 'block'
	window.armyWeather.util.applyColorTheme()
}