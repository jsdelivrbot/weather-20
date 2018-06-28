import {PopupDisplayFinished} from '../popup.js'
import {LocalWeatherUpdate} from '../weather/local-weather.js'
import API from '../../transmitter/api.js'

let popupPannel = document.getElementById('popup')
let questionPannel = document.getElementById('address-question')
let questionClose = document.getElementById('address-question-close')

let addressBox = document.getElementById(`address-box`)
let isAlreadyListnerInstalled = false
let callback = null

let addressSlider = null
let lastCheckedTimestamp = null

let finisher = () => {

	if(addressSlider != null)
		addressSlider.destroy()
	addressSlider = null

	addressBox.innerHTML = ``
	currentSelected = ``

	popupPannel.style.display = 'none'
	questionPannel.style.display = 'none'
	
	PopupDisplayFinished()
}

let currentSelected = ''

export function AddressQuestionInit (){
	window.armyWeather.util.addressSelect = (timestamp, selected)=>{

		// 슬라이더 닫혔으면 패스
		if(addressSlider === null) return

		// 중복 주소 처리 방지
		if(lastCheckedTimestamp === timestamp) return
		lastCheckedTimestamp = timestamp

		if(currentSelected.length != 0)
			currentSelected += '.'
		currentSelected += selected

		API.call('/api/address',{key:currentSelected},(paramDatas)=>{

			try{
				if(paramDatas.isLast){
					// TODO 현재 위치 적용
					// document.getElementById(`day-weather-location-info2`).innerHTML = currentSelected.split('.').join(' ')
					window.armyWeather.private.address.main = {
						cell: paramDatas.data[0],
						long: paramDatas.data[1],
						lat: paramDatas.data[2],
						key: currentSelected
					}
					// TODO
					// 새로 그려넣기 추가
					currentSelected = ``
					finisher()
					LocalWeatherUpdate()
					return
				}
			}catch(e){}

			// 슬라이더 닫혔으면 패스
			if(addressSlider === null) return

			try{
				let addressHTML = '<div id=address-slider>'
				let paramTimestamp = (new Date()).getTime()
				for(let paramData of paramDatas.data){

					addressHTML += 
`<a href="javascript:window.armyWeather.util.addressSelect(${paramTimestamp},'${paramData}')"><div class="address-message">
<div class="address-context">
${(paramData.length ==0) ? '(전체)' : paramData }
</div>
</div></a>`
				}
				addressHTML += `</div>`
				addressBox.innerHTML = ``
				addressBox.insertAdjacentHTML('beforeend', addressHTML)

				// 슬라이더 추가
				addressSlider = tns({
					container: '#address-slider',
					items: 6,
					slideBy: 'page',
					axis: 'vertical',
					controlsText: ['이전', '다음'],
					mouseDrag: true,
					autoHeight: false,
					controls: true,
					autoplay: false,
					nested: true,
					speed: 300,
					swipeAngle: false,
					freezable: false,
					arrowKeys: true
				})
			}catch(e){}
		})
	}

	//weatherLocation.addEventListener('click', (event)=>{

	//	// 기본 로그인 처리
	//	AddressQuestion()
	//})
}

export function AddressQuestion (paramCallback) {
	popupPannel.style.display = 'block'
	questionPannel.style.display = 'block'

	if(!isAlreadyListnerInstalled) {
		isAlreadyListnerInstalled = true

		questionClose.addEventListener('click', (event)=>{
			finisher()
		})

		// 터치방지용
		popupPannel.addEventListener('click', (event)=>{
			event.stopPropagation()
		})

		isAlreadyListnerInstalled = true
	}
	
	if(addressSlider === null){
		
		// 1차 주소요청
		API.call('/api/address',{},(paramDatas)=>{

			try{
				let addressHTML = '<div id=address-slider>'
				let paramTimestamp = (new Date()).getTime()
				for(let paramData of paramDatas.data){
					addressHTML += 
`<a href="javascript:window.armyWeather.util.addressSelect(${paramTimestamp},'${paramData}')"><div class="address-message">
<div class="address-context">
${(paramData.length ==0)?'(입력완료)':paramData }
</div>
</div></a>`
				}
				addressHTML += `</div>`
				addressBox.innerHTML = ``
				addressBox.insertAdjacentHTML('beforeend', addressHTML)

				// 슬라이더 추가
				addressSlider = tns({
					container: '#address-slider',
					items: 6,
					slideBy: 'page',
					axis: 'vertical',
					controlsText: ['이전', '다음'],
					mouseDrag: true,
					autoHeight: false,
					controls: true,
					autoplay: false,
					nested: true,
					speed: 300,
					swipeAngle: false,
					freezable: false,
					arrowKeys: true
				})
			}catch(e){}
		})
	}

	callback = paramCallback
	window.armyWeather.util.applyColorTheme()
}