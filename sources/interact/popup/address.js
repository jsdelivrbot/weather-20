import {PopupDisplayFinished} from '../popup.js'
import {LocalWeatherUpdate} from '../weather/local-weather.js'
import {UpdateAddressBar} from '../life/address.js'
import API from '../../transmitter/api.js'

let popupPannel = document.getElementById('popup')
let questionPannel = document.getElementById('address-question')

let addressBox = document.getElementById(`address-box`)
let isAlreadyListnerInstalled = false
let callback = null

let addressSlider = null

// 메인 주소슬라이더 중 선택된 아이템 번째 수
let currentSelectedIndexNum = null

// 필터링할 단어목록
let filteredWords = []
let finisher = () => {

	if(addressSlider != null)
		addressSlider.destroy()
	addressSlider = null

	addressBox.innerHTML = ``
	currentSearchMode = 'list'

	popupPannel.style.display = 'none'
	questionPannel.style.display = 'none'
	document.getElementById('address-input').value = ''

	PopupDisplayFinished()
}

let currentSelected = ''
let lastParamDatas = null

// 기본검색모드 설정
let currentSearchMode = 'list'
let selectInput = document.getElementById('address-select-input')
let selectList = document.getElementById('address-select-list')

export function SelectModeUpdate(){
	if(selectInput.classList.contains('address-type-item-selected'))
		selectInput.classList.remove('address-type-item-selected')
	if(selectList.classList.contains('address-type-item-selected'))
		selectList.classList.remove('address-type-item-selected')
	if(currentSearchMode == 'list')
		selectList.classList.add('address-type-item-selected')
	if(currentSearchMode == 'input')
		selectInput.classList.add('address-type-item-selected')
}

export function AddressSelect(selectedNum, processCallback, innerText){
	// 슬라이더 닫혔으면 패스
	if(addressSlider === null) return;
	
	if(currentSelected.length != 0)
		currentSelected += '.'
	//currentSelected += document.getElementById(`address-item-${selectedNum}`).children[0].innerText
	currentSelected += innerText

	if(currentSearchMode == 'list'){
		API.call('/api/address',{key:currentSelected},(paramDatas)=>{
			try{
				if(paramDatas.isLast){
					let addressLastNamePre = currentSelected.split('.')
					let addressName = ''
					for(let preNameIndex = addressLastNamePre.length-1; preNameIndex>=0;preNameIndex--){
						let preAddressName = addressLastNamePre[preNameIndex]
						if(preAddressName.length != 0){
							addressName = preAddressName
							break
						}
					}

					finisher()

					if(typeof processCallback != undefined && processCallback != null){
						processCallback(addressName, paramDatas, currentSelected, currentSelectedIndexNum)
					}
					currentSelected = ``
					UpdateAddressBar()
					LocalWeatherUpdate()

					return
				}
			}catch(e){
				console.log(e)
			}

			// 슬라이더 닫혔으면 패스
			if(addressSlider === null) return
			AddressSliderUpdate(paramDatas)
		})
	}else if(currentSearchMode == 'input'){
		if(lastParamDatas === null) return
		let lastParamData = lastParamDatas.data[selectedNum]

		let addressLastNamePre = lastParamData[3].split('.')
		let addressName = ''
		for(let preNameIndex = addressLastNamePre.length-1; preNameIndex>=0;preNameIndex--){
			let preAddressName = addressLastNamePre[preNameIndex]
			if(preAddressName.length != 0){
				addressName = preAddressName
				break
			}
		}

		finisher()
		if(typeof processCallback != undefined && processCallback != null){
			lastParamData = { data: lastParamData }
			processCallback(addressName, lastParamData, lastParamData.data[3], currentSelectedIndexNum)
		}

		currentSelected = ``
		UpdateAddressBar()
		LocalWeatherUpdate()
	}
}

export function AddressSliderUpdate(paramDatas){
	if(addressSlider != null)
		addressSlider.destroy()

	if(paramDatas === undefined){
		paramDatas = lastParamDatas
	}else{
		lastParamDatas = paramDatas
	}

	try{
		let addressHTML = '<div id=address-slider class=popup-address-slider><div class=swiper-wrapper>'

		// 순서대로 소트
		paramDatas.data.sort()
		if(currentSearchMode == 'list'){
			for(let paramDataIndex in paramDatas.data){
				let paramData = paramDatas.data[paramDataIndex]

				// 만약 찾는 단어가 없으면 넘기기
				let isFilterMatched = true
				for(let filteredWord of filteredWords){
					if(paramData.indexOf(filteredWord) === -1){
						isFilterMatched = false
						break
					}
				}
				if(!isFilterMatched) continue;

				let addressInnerName = (paramData.length ==0) ? '(전체)' : paramData 
				addressHTML +=
				`<div class="address-message swiper-slide" onclick="window.armyWeather.callback.popupAddressTouch(${paramDataIndex}, '${addressInnerName}')">
				<div class="address-context">
				${ addressInnerName }
				</div>
				</div>`
			}
		}else if(currentSearchMode == 'input'){
			for(let paramDataIndex in paramDatas.data){
				let paramData = paramDatas.data[paramDataIndex]

				let addressInnerName = (paramData.length ==0) ? '(전체)' : paramData[3].split('.').join(' ')
				addressHTML +=
				`<div class="address-message swiper-slide" onclick="window.armyWeather.callback.popupAddressTouch(${paramDataIndex}, '${addressInnerName}')">
				<div class="address-context">
				${ addressInnerName }
				</div>
				</div>`
			}
		}
		addressHTML += `</div><div class="swiper-scrollbar white-scrollerbar"></div></div>`
		addressBox.innerHTML = ``
		addressBox.insertAdjacentHTML('beforeend', addressHTML)
	}catch(e){}

	// 슬라이더 추가
	addressSlider = new Swiper('.popup-address-slider', {
		direction: 'vertical',
		slidesPerView: 7,
		spaceBetween: 12,
		mousewheel: true,
		scrollbar: {
			el: '.swiper-scrollbar',
			hide: false,
		}
	})
}

export function AddressQuestionInit (){
	window.armyWeather.callback.popupAddressTouch = function (currentPage, innerText){
		setTimeout(()=>{
			if(callback === null || callback === undefined){

				// 기본적으로 주소바 정보를 변경합니다.
				AddressSelect(currentPage, (addressName, paramDatas, currentSelected, currentSelectedIndexNum)=>{
					window.armyWeather.private.address.main = {
						name: addressName,
						cell: paramDatas.data[0],
						long: paramDatas.data[1],
						lat: paramDatas.data[2],
						key: currentSelected
					}

					if(window.armyWeather.private.address.sub.length === 0 ||
					  (window.armyWeather.private.address.sub.length-1) < currentSelectedIndexNum)
						currentSelectedIndexNum = null

					if(currentSelectedIndexNum === null){
						window.armyWeather.private.address.sub.push({
							name: addressName,
							cell: paramDatas.data[0],
							long: paramDatas.data[1],
							lat: paramDatas.data[2],
							key: currentSelected
						})
						window.armyWeather.private.address.index = window.armyWeather.private.address.sub.length-1
						if(window.armyWeather.private.address.index < 0) window.armyWeather.private.address.index = 0
					}else{
						window.armyWeather.private.address.index = currentSelectedIndexNum
						window.armyWeather.private.address.sub[currentSelectedIndexNum] = {
							name: addressName,
							cell: paramDatas.data[0],
							long: paramDatas.data[1],
							lat: paramDatas.data[2],
							key: currentSelected
						}
					}
				}, innerText)
			}else{
				// 콜백이 존재하면 해당 콜백을 실행합니다.
				if(typeof callback === 'function')
					AddressSelect(currentPage, callback, innerText)
			}
		},1)
	}
}

export function AddressQuestion (paramCallback, selectedIndexNum = null) {
	document.getElementById(`heat-question`).style.display = 'none'
	popupPannel.style.display = 'block'
	questionPannel.style.display = 'block'
	currentSelectedIndexNum = selectedIndexNum

	if(!isAlreadyListnerInstalled) {
		isAlreadyListnerInstalled = true

		// 검색창 닫기
		document.getElementById('address-question-close').addEventListener('click', (event)=>{
			currentSearchMode = 'list'
			SelectModeUpdate()
			finisher()
		})

		// 아이템 삭제
		document.getElementById('address-item-remove').addEventListener('click', (event)=>{
			if(typeof window.armyWeather.private.address.sub[currentSelectedIndexNum] != 'undefined'){
				window.armyWeather.private.address.sub.splice(currentSelectedIndexNum, 1)
				window.armyWeather.private.address.index = 1
				let refill = window.armyWeather.private.address.sub[0]
				if(refill === undefined)
					refill = window.armyWeather.private.address.gps
				window.armyWeather.private.address.main = refill
				UpdateAddressBar()
				LocalWeatherUpdate()
			}
			finisher()
		})

		currentSearchMode = 'list'
		SelectModeUpdate()

		// 검색 모드 전환
		selectInput.addEventListener('click', (event)=>{
			API.call('/api/address',{search: ''},(paramDatas)=>{
				currentSelected = ''
				currentSearchMode = 'input'
				SelectModeUpdate()
				AddressSliderUpdate(paramDatas)
			})
		})
		selectList.addEventListener('click', (event)=>{
			API.call('/api/address',{},(paramDatas)=>{
				currentSelected = ''
				currentSearchMode = 'list'
				SelectModeUpdate()
				AddressSliderUpdate(paramDatas)
			})
		})

		// 슬라이더 검색용 코드
		document.getElementById(`address-input`).onkeyup = function (){
			filteredWords = (document.getElementById(`address-input`).value).split(' ')
			if(currentSearchMode == 'list'){
				AddressSliderUpdate()
			}else if(currentSearchMode == 'input'){
				API.call('/api/address',{search: filteredWords.join(' ')},(paramDatas)=>{
					AddressSliderUpdate(paramDatas)
				})
			}
		}

		// 터치방지용
		popupPannel.addEventListener('click', (event)=>{
			event.stopPropagation()
		})

		isAlreadyListnerInstalled = true
	}

	if(addressSlider === null){
		if(currentSearchMode == 'list'){
			// 최초 주소요청
			API.call('/api/address',{},(paramDatas)=>{
				AddressSliderUpdate(paramDatas)
			})
		}else if(currentSearchMode == 'input'){
			API.call('/api/address',{search: ''},(paramDatas)=>{
				AddressSliderUpdate(paramDatas)
			})
		}
	}

	callback = paramCallback
	window.armyWeather.util.applyColorTheme()
}