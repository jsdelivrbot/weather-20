import {LoginQuestion, LoginQuestionInit} from './popup/login.js'
import {AddressQuestion, AddressQuestionInit} from './popup/address.js'
import {ReportWriteInit} from './popup/report.js'

// 이미 팝업이 열려있는지 여부
let isOtherPopupDisplayed = false

export function PopupInit (){
	LoginQuestionInit()
	AddressQuestionInit()
	ReportWriteInit()
}

// 라이트박스 팝업을 띄우는 요청은 이 함수를 통해 일원화 되어있습니다.
export function PopupInteract (type, callback){

	// 만약 팝업이 이미 열려있는데 또 열으면 부정값 반환
	if(isOtherPopupDisplayed == true) return false

	isOtherPopupDisplayed = true
	switch(type){
	case 'login-question':
		LoginQuestion(callback)
		break
	case 'address-question':
		AddressQuestion(callback)
		break
	default:
		isOtherPopupDisplayed = false
		break
	}

	return isOtherPopupDisplayed
}

export function IsPopupDisplaying (){ return isOtherPopupDisplayed }
export function PopupDisplayFinished (){ isOtherPopupDisplayed = false }
export default PopupInteract