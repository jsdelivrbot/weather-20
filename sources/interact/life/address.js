import {AddressQuestion} from '../popup/address.js'
import {LocalWeatherUpdate} from '../weather/local-weather.js'

let addressSlider = null
let sliderBox = document.getElementById(`local-address-slider`)


export function UpdateAddressBar(){
	if(addressSlider !== null)
		addressSlider.destroy()

	sliderBox.innerHTML = ``

	let innerHTML = `<div class=swiper-wrapper>`

	// GPS 위치명이 있으면 출력
	if(window.armyWeather.private.address.sub.length == 0){
		let gpsAddressName = `확인중..`
		if(window.armyWeather.private.address.gps != null){
			let addressLastNamePre = window.armyWeather.private.address.gps.key.split('.')
			//gpsAddressName = addressLastNamePre[addressLastNamePre.length-1]
			
			let foundedName = ``
			for(let nameCheckIndex = (addressLastNamePre.length-1);nameCheckIndex>=0;nameCheckIndex--){
				let preCheckGpsAddressName = addressLastNamePre[nameCheckIndex]

				if(preCheckGpsAddressName.length != 0){
					foundedName = preCheckGpsAddressName
					break
				}
			}
			gpsAddressName = foundedName
		}

		// 3글자 넘어가면 .. 처리
		if(gpsAddressName.length > 3){
			gpsAddressName = gpsAddressName.split('')
			gpsAddressName = `${[gpsAddressName[0],gpsAddressName[1],gpsAddressName[2]].join('')}..`
		}
		let isGPSSelected = window.armyWeather.private.address.index === 1
		let gpsStyleOption = isGPSSelected ? `location-small-box-selected` : ``
		innerHTML += `
		<div class="swiper-slide">
			<div class="location-small-box location-small-box-gps ${gpsStyleOption} location-small-box-cover" onclick="window.armyWeather.callback.lifeAddressTouch(${1})">
				<a id="day-weather-location-info2" class="location-small-box-name">${gpsAddressName}</a>
				<br/>
			</div>
			<div class="location-small-box location-small-box-gps ${gpsStyleOption} location-small-box-under"></div>
		</div>
		`
	}

	// 나머지 슬라이드 표시
	// 슬라이드 터치 후 해당 주소선택되도록
	for(let subIndex in window.armyWeather.private.address.sub){
		let realIndex = (Number(subIndex))
		let isSelected = window.armyWeather.private.address.index == realIndex
		let styleOption = isSelected ? `location-small-box-selected` : ``

		let sub = window.armyWeather.private.address.sub[subIndex]
		let name = ''
		if(typeof sub['name'] != 'undefined')
			name = sub['name']

		// 3글자 넘어가면 .. 처리
		if(name.length > 3){
			name = name.split('')
			name = `${[name[0],name[1],name[2]].join('')}..`
		}

		innerHTML += `
		<div class="swiper-slide">
			<div class="location-small-box ${styleOption} location-small-box-cover" onclick="window.armyWeather.callback.lifeAddressTouch(${realIndex})">
				<a class="location-small-box-name">${name}</a>
				<br/>
			</div>
			<div class="location-small-box ${styleOption} location-small-box-under"></div>
		</div>`
	}

	// 만약 설정된 주소가 4개 미만인 경우
	// 슬라이드 추가버튼 표시
	let subCount = window.armyWeather.private.address.sub.length
	let needToAddCount = 0

	if(subCount < 4){
		needToAddCount = 4 - subCount
		for(let i=1;i<=needToAddCount;i++){
			let realIndex = 1 + (subCount + i)
			let isSelected = window.armyWeather.private.address.index == realIndex
			let styleOption = isSelected ? `location-small-box-selected` : ``
			innerHTML += `<div class="swiper-slide">
				<div class="location-small-box location-small-box-yet ${styleOption} location-small-box-cover" onclick="window.armyWeather.callback.lifeAddressTouch(${realIndex})">
					<a class="location-small-box-name">+</a>
					<br/>
				</div>
				<div class="location-small-box location-small-box-yet ${styleOption} location-small-box-under"></div>
			</div>`
		}
	}

	// 맨 마지막에 슬라이드 추가버튼 표시
	let realIndex = 1 + subCount + needToAddCount + 1
	let isSelected = window.armyWeather.private.address.index == realIndex
	let styleOption = isSelected ? `location-small-box-selected` : ``
	innerHTML += `<div class="swiper-slide">
		<div class="location-small-box location-small-box-yet ${styleOption} location-small-box-cover" onclick="window.armyWeather.callback.lifeAddressTouch(${realIndex})">
			<a class="location-small-box-name">+</a>
			<br/>
		</div>
		<div class="location-small-box location-small-box-yet ${styleOption} location-small-box-under"></div>
	</div>`

	innerHTML += `</div><div class="swiper-scrollbar"></div>`
	sliderBox.insertAdjacentHTML('beforeend', innerHTML)

	addressSlider = new Swiper('.local-address-slider', {
		slidesPerView: 5,
		centeredSlides: false,
		spaceBetween: 0,
		grabCursor: true,
		scrollbar: {
			el: '.swiper-scrollbar',
			hide: true,
		}
	})
}

export function AddressInit (){
	let addressItemMultiTouchEdit = null
	window.armyWeather.callback.lifeAddressTouch = function (currentPage){
		//let currentPage = Number(slideElement.id.split(`location-item-`)[1])
		addressItemMultiTouchEdit = currentPage

		// 이미 활성화되어있는 아이템을 선택한 경우 반환
		if(window.armyWeather.private.address.index == currentPage){
			//alert(`정상감지함: 활성화된 ${currentPage} 번 터치`)

			// 그러나 2번 터치하면 수정
			if(addressItemMultiTouchEdit == currentPage){
				AddressQuestion(null, currentPage)
				addressItemMultiTouchEdit = null
				return
			}
			return
		}

		// 정의되지 않은 주소를 선택한 경우
		if(typeof window.armyWeather.private.address.sub[currentPage] == 'undefined'){
			//alert(`정상감지함: 정의 안 된 ${currentPage} 번 터치`)
			AddressQuestion(null, currentPage)
			return
		}

			//alert(`정상감지함: 정의 된 ${currentPage} 번 터치`)
		// 정의된 주소면 그냥 주소선택만 바구고 끝
		window.armyWeather.private.address.index = currentPage
		window.armyWeather.private.address.main = window.armyWeather.private.address.sub[currentPage]

		setTimeout(()=>{
			UpdateAddressBar()
			LocalWeatherUpdate()
		},1)
	}

	// 동적으로 address 정보 html 추가
	UpdateAddressBar()
}