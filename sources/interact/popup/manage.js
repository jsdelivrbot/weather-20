import {PopupDisplayFinished} from '../popup.js'
import {LocalWeatherUpdate, LocalWeatherRedraw} from '../weather/local-weather.js'
import API from '../../transmitter/api.js'

let popupPannel = document.getElementById('popup')
let questionPannel = document.getElementById('manage-question')

let manageBox = document.getElementById(`manage-box`)
let isAlreadyListnerInstalled = false
let callback = null
let manageSlider = null

let finisher = () => {

	if(manageSlider != null)
		manageSlider.destroy()
	manageSlider = null

	manageBox.innerHTML = ``
	currentSearchMode = 'subtitle' //subtitle waiting admins

	popupPannel.style.display = 'none'
	questionPannel.style.display = 'none'

	PopupDisplayFinished()
}

let lastParamDatas = null
let lastLocalParamDatas = null

// 기본검색모드 설정
let currentSearchMode = 'subtitle' 
let selectWaitingList = document.getElementById('manage-select-input')
let selectSubtitleList = document.getElementById('manage-select-list')
let selectAdminList = document.getElementById('manage-select-admins')

export function SelectModeUpdate(){
	if(selectWaitingList.classList.contains('manage-type-item-selected'))
		selectWaitingList.classList.remove('manage-type-item-selected')
	if(selectSubtitleList.classList.contains('manage-type-item-selected'))
		selectSubtitleList.classList.remove('manage-type-item-selected')
	if(selectAdminList.classList.contains('manage-type-item-selected'))
		selectAdminList.classList.remove('manage-type-item-selected')

	if(currentSearchMode == 'subtitle')
		selectSubtitleList.classList.add('manage-type-item-selected')
	if(currentSearchMode == 'waiting')
		selectWaitingList.classList.add('manage-type-item-selected')
	if(currentSearchMode == 'admins')
		selectAdminList.classList.add('manage-type-item-selected')
}


let currentReceivedWaitingList = []
let currentReceivedAdminsList = []
export function ManageSelect(selectedNum, processCallback){
	// 슬라이더 닫혔으면 패스
	if(manageSlider === null) return

	finisher()
	if(typeof processCallback != undefined && processCallback != null){
		processCallback()
	}
	LocalWeatherUpdate()
}

/**
 * @param {object} paramDatas 최고관리자 공지정보
 * @param {object} localParamDatas 지역관리자 공지정보
 */
export function manageSliderUpdate(paramDatas, localParamDatas){
	if(manageSlider != null)
		manageSlider.destroy()

	if(paramDatas === undefined){
		paramDatas = lastParamDatas
	}else{
		lastParamDatas = paramDatas
	}
	if(localParamDatas === undefined){
		localParamDatas = lastLocalParamDatas
	}else{
		lastLocalParamDatas = localParamDatas
	}

	try{
		let manageHTML = '<div id=manage-slider class=popup-manage-slider><div class=swiper-wrapper>'

		if(currentSearchMode == 'subtitle'){
			if(localParamDatas !== null && localParamDatas !== undefined)
				paramDatas = paramDatas.concat(localParamDatas)
			for(let paramDataIndex in paramDatas){
				let paramData = paramDatas[paramDataIndex]

				manageHTML +=
				`<div class="manage-message swiper-slide">
				<a class="manage-context">${ paramData }</a>
				<div style="
					position:  relative;
					width: 71px;
					height: 53px;
					background: #ffffff;
					border-radius: 12px;
					border-style:  solid;
					left: 201px;
					border-width:  2px;
					border-color: #fff;
					color: #484848;
				" onclick="window.armyWeather.callback.manageAllowTouch(${paramDataIndex})"><a style="
					position: absolute;
					top: 18px;
					left: 14px;
				" >승인됨</a></div>
				<div style="
					position:  relative;
					width: 71px;
					height: 53px;
					background: #b97070;
					border-radius: 12px;
					border-style:  solid;
					left: 201px;
					border-width:  2px;
					border-color: #b97070;
					color: #fff;
					top: 10px;
				" onclick="window.armyWeather.callback.manageDeleteTouch(${paramDataIndex})"><a style="
					position: absolute;
					top: 18px;
					left: 19px;
				">삭제</a></div>
				</div>`
			}
		}else if(currentSearchMode == 'waiting'){
			currentReceivedWaitingList = paramDatas
			for(let paramDataIndex in paramDatas){
				let paramData = paramDatas[paramDataIndex]

				manageHTML +=
				`<div class="manage-message swiper-slide">
				<div class="manage-context" style="
					position:  relative;
					top: 3px;
					left: -1px;
				">이름: ${paramData.name}</div>
				<div class="manage-context" style="
					position:  relative;
					top: 13px;
					left: 0px;
					color: #7d7d7d;
					font-size:  12px;
				">아이디: ${ paramData.id }</div>
				<div class="manage-context" style="
					font-size:  13px;
					top: 23px;
					left: -4px;
				">근무지: ${ paramData.workPlace }</div>
				<div class="manage-context" style="
					font-size:  11px;
					top: -21px;
					right: 1px;
					color: #858580;
				">전화번호: ${ paramData.contractNumber }</div>
				<div style="
					position:  relative;
					width: 71px;
					height: 53px;
					background: #ffffff;
					border-radius: 12px;
					border-style:  solid;
					left: 201px;
					border-width:  2px;
					border-color: #fff;
					color: #484848;
				" onclick="window.armyWeather.callback.manageAllowTouch(${paramDataIndex})"><a style="
					position: absolute;
					top: 18px;
					left: 14px;
				" >승인됨</a></div>
				<div style="
					position:  relative;
					width: 71px;
					height: 53px;
					background: #b97070;
					border-radius: 12px;
					border-style:  solid;
					left: 201px;
					border-width:  2px;
					border-color: #b97070;
					color: #fff;
					top: 10px;
				" onclick="window.armyWeather.callback.manageDeleteTouch(${paramDataIndex})"><a style="
					position: absolute;
					top: 18px;
					left: 19px;
				">삭제</a></div>
				<div class="manage-context" style="
					font-size:  11px;
					top: -87px;
					right: 1px;
					color: #858580;
				">관리지역: ${paramData.cellName}(${paramData.cell})</div>
				</div>`
			}
		}else if(currentSearchMode == 'admins'){
			currentReceivedAdminsList = paramDatas
			for(let paramDataIndex in paramDatas){
				let paramData = paramDatas[paramDataIndex]
				if(paramData === null || paramData === undefined) continue

				manageHTML +=
				`<div class="manage-message swiper-slide">
				<div class="manage-context" style="
					position:  relative;
					top: 3px;
					left: -1px;
				">이름: ${paramData.realName}</div>
				<div class="manage-context" style="
					position:  relative;
					top: 13px;
					left: 0px;
					color: #7d7d7d;
					font-size:  12px;
				">아이디: ${ paramData.id }</div>
				<div class="manage-context" style="
					font-size:  13px;
					top: 23px;
					left: -4px;
				">근무지: ${ paramData.workLocation }</div>
				<div class="manage-context" style="
					font-size:  11px;
					top: -21px;
					right: 1px;
					color: #858580;
				">전화번호: ${ paramData.contactNumber }</div>
				<div style="
					position:  relative;
					width: 71px;
					height: 53px;
					background: #ffffff;
					border-radius: 12px;
					border-style:  solid;
					left: 201px;
					border-width:  2px;
					border-color: #fff;
					color: #484848;
				" onclick="window.armyWeather.callback.manageAllowTouch(${paramDataIndex})"><a style="
					position: absolute;
					top: 18px;
					left: 14px;
				" >승인됨</a></div>
				<div style="
					position:  relative;
					width: 71px;
					height: 53px;
					background: #b97070;
					border-radius: 12px;
					border-style:  solid;
					left: 201px;
					border-width:  2px;
					border-color: #b97070;
					color: #fff;
					top: 10px;
				" onclick="window.armyWeather.callback.manageDeleteTouch(${paramDataIndex})"><a style="
					position: absolute;
					top: 18px;
					left: 19px;
				">삭제</a></div>
				<div class="manage-context" style="
					font-size:  11px;
					top: -87px;
					right: 1px;
					color: #858580;
				">관리지역: ${paramData.selectedControlArea.cellName}(${paramData.selectedControlArea.cellNumber})</div>
				</div>`
			}
		}
		manageHTML += `</div><div class="swiper-scrollbar white-scrollerbar"></div></div>`
		manageBox.innerHTML = ``
		manageBox.insertAdjacentHTML('beforeend', manageHTML)
	}catch(e){}

	// 슬라이더 추가
	manageSlider = new Swiper('.popup-manage-slider', {
		direction: 'vertical',
		autoHeight: true,
		slidesPerView: 3,
		spaceBetween: 20,
		mousewheel: true,
		scrollbar: {
			el: '.swiper-scrollbar',
			hide: false,
		}
	})
}

export function ManageQuestionInit () {
	window.armyWeather.callback.manageAllowTouch = function (currentPage){
		
		if(currentSearchMode == 'subtitle'){

			// 
		}else if(currentSearchMode == 'waiting'){

			// 승인대기자 삭제요청
			API.call('/api/waiting-authorize',{
				id: window.armyWeather.private.identy.uid,
				pw: window.armyWeather.private.identy.upw,
				peerId: window.armyWeather.private.identy.pid,
				targetid: currentReceivedWaitingList[currentPage]['id'],
				cell: currentReceivedWaitingList[currentPage]['cell']
			},(paramDatas)=>{
				if(paramDatas.isSuccess){
					alert(paramDatas.message)
				}else{
					alert(paramDatas.message)
				}
				manageSliderUpdate(paramDatas.waitingData)
				LocalWeatherUpdate()
				LocalWeatherRedraw()
			})
		}
	}
	window.armyWeather.callback.manageDeleteTouch = function (currentPage){

		if(currentSearchMode == 'subtitle'){

			// 여기서 지역/전국 감지
			let isGlobalSubtitle = (typeof window.armyWeather.private.SubtitleData[currentPage]) != 'undefined'
			
			if(isGlobalSubtitle){
				// 전국 자막 삭제요청
				API.call('/api/subtitle-delete',{
					id: window.armyWeather.private.identy.uid,
					pw: window.armyWeather.private.identy.upw,
					peerId: window.armyWeather.private.identy.pid,
					context: window.armyWeather.private.SubtitleData[currentPage]
				},(paramDatas)=>{
					if(paramDatas.isSuccess){
						alert(paramDatas.message)
					}else{
						alert(paramDatas.message)
					}

					let localSubtitlesOutSide = null
					try{
						localSubtitlesOutSide = window.armyWeather.private.localAreaData.data.data.subtitles
					}catch(e){}
					manageSliderUpdate(paramDatas.subtitleData, localSubtitlesOutSide)
					LocalWeatherUpdate()
					LocalWeatherRedraw()
				})
			}else{
				// 지역 자막 삭제요청
				let localCurrentPage = currentPage - window.armyWeather.private.SubtitleData.length
				let preAreaData = window.armyWeather.private.localAreaData
				preAreaData.data.data.subtitles.splice(Number(localCurrentPage), 1)
				API.call('/api/areadata-update',{
					id: window.armyWeather.private.identy.uid,
					pw: window.armyWeather.private.identy.upw,
					peerId: window.armyWeather.private.identy.pid,
					cell: window.armyWeather.private.identy.cell,
					data: preAreaData.data.data
				},(paramDatas)=>{
					if(paramDatas.isSuccess){
						alert(paramDatas.message)
						let localSubtitlesOutSide = null

						try{
							localSubtitlesOutSide = window.armyWeather.private.localAreaData.data.data.subtitles
						}catch(e){}
						manageSliderUpdate(paramDatas.subtitleData, localSubtitlesOutSide)
						LocalWeatherUpdate()
						LocalWeatherRedraw()
					}else{
						alert(paramDatas.message)
					}
				})
			}
		}else if(currentSearchMode == 'waiting'){

			// 승인대기자 삭제요청
			API.call('/api/waiting-delete',{
				id: window.armyWeather.private.identy.uid,
				pw: window.armyWeather.private.identy.upw,
				peerId: window.armyWeather.private.identy.pid,
				targetid: currentReceivedWaitingList[currentPage]['id']
			},(paramDatas)=>{
				if(paramDatas.isSuccess){
					alert(paramDatas.message)
				}else{
					alert(paramDatas.message)
				}
				manageSliderUpdate(paramDatas.waitingData)
				LocalWeatherUpdate()
				LocalWeatherRedraw()
			})
		}else if(currentSearchMode == 'admins'){

			// 승인대기자 삭제요청
			API.call('/api/admin-unregister',{
				id: window.armyWeather.private.identy.uid,
				pw: window.armyWeather.private.identy.upw,
				peerId: window.armyWeather.private.identy.pid,
				targetid: currentReceivedAdminsList[currentPage]['id']
			},(paramDatas)=>{
				if(paramDatas.isSuccess){
					alert(paramDatas.message)
				}else{
					alert(paramDatas.message)
				}
				manageSliderUpdate(paramDatas.adminList)
				LocalWeatherUpdate()
				LocalWeatherRedraw()
			})
		}
	}

	document.getElementById(`menu-logo`).addEventListener('click', (event)=>{
		if(window.armyWeather.private.isOverPower || window.armyWeather.private.isLocalPower){
			LocalWeatherUpdate(()=>{
				ManageQuestion()
			})
		}
	})
}

export function ManageQuestion (paramCallback, selectedIndexNum = null) {
	if(window.armyWeather.private.isLocalPower){

		// 최고위 관리자가 아닐때만
		if(!window.armyWeather.private.isOverPower){
			// 만약 자기 위치가 아닌 곳의 수정자료를 보려하면
			if(window.armyWeather.private.address.main.cell != window.armyWeather.private.identy.cell){
				alert(`해당지역은 지역관리 권한을 허용받지 않았습니다.\n승인된 관할지역 정보만 확인 및 수정이 가능합니다.`)
			}
		}
	}
	
	document.getElementById(`heat-question`).style.display = 'none'
	popupPannel.style.display = 'block'
	questionPannel.style.display = 'block'

	if(!isAlreadyListnerInstalled) {
		isAlreadyListnerInstalled = true

		// 검색창 닫기
		document.getElementById('manage-question-close').addEventListener('click', (event)=>{
			currentSearchMode = 'subtitle'
			SelectModeUpdate()
			finisher()
		})

		// 자막 추가
		document.getElementById('manage-item-add').addEventListener('click', (event)=>{

			if(document.getElementById(`manage-input`).value.length < 5){
				alert(`전송할 알림 내용은 5자 이상이여야 합니다.`)
				return
			}

			if(document.getElementById(`manage-input`).value.length > 40){
				alert(`전송할 알림 내용은 40자 이하여야 합니다.`)
				return
			}

			API.call('/api/subtitle-write', {
				// 아래부터 공개 데이터
				id: window.armyWeather.private.identy.uid,
				pw: window.armyWeather.private.identy.upw,
				peerId: window.armyWeather.private.identy.pid,
				context: document.getElementById(`manage-input`).value
			},(paramData)=>{

				// 기본 처리콜백
				if(paramData.isSuccess){
					alert(paramData.message)

					// 창 업데이트
					setTimeout(()=>{
						let localSubtitlesOutSide = null
						try{
							if(typeof paramData['localSubtitleData'] != 'undefined'){
								window.armyWeather.private.localAreaData = paramData['localSubtitleData']
							}
							localSubtitlesOutSide = window.armyWeather.private.localAreaData.data.data.subtitles
						}catch(e){}
						manageSliderUpdate(paramData.subtitleData, localSubtitlesOutSide)
						LocalWeatherUpdate()
						LocalWeatherRedraw()
					}, 1000)
				}else{
					alert(paramData.message)
				}
			})
		})

		// 페이지뷰 전환
		selectWaitingList.addEventListener('click', (event)=>{

			API.call('/api/waiting-list', {
				// 아래부터 공개 데이터
				id: window.armyWeather.private.identy.uid,
				pw: window.armyWeather.private.identy.upw,
				peerId: window.armyWeather.private.identy.pid
			},(paramData)=>{

				// 기본 처리콜백
				if(paramData.isSuccess){

					// 창 업데이트
					currentSearchMode = 'waiting'
					SelectModeUpdate()
					manageSliderUpdate(paramData.waitingData)
				}else{
					alert(paramData.message)
				}
			})
		})
		selectSubtitleList.addEventListener('click', (event)=>{
			currentSearchMode = 'subtitle'
			SelectModeUpdate()

			LocalWeatherUpdate(()=>{
				let localSubtitlesInside  = null
				try{
					localSubtitlesInside = window.armyWeather.private.localAreaData.data.data.subtitles
				}catch(e){}
				manageSliderUpdate(window.armyWeather.private.SubtitleData, localSubtitlesInside)
			})
		})
		selectAdminList.addEventListener('click', (event)=>{

			API.call('/api/admin-list', {
				// 아래부터 공개 데이터
				id: window.armyWeather.private.identy.uid,
				pw: window.armyWeather.private.identy.upw,
				peerId: window.armyWeather.private.identy.pid
			},(paramData)=>{

				// 기본 처리콜백
				if(paramData.isSuccess){

					// 창 업데이트
					currentSearchMode = 'admins'
					SelectModeUpdate()
					manageSliderUpdate(paramData.data)
				}else{
					alert(paramData.message)
				}
			})
		})

		// 터치방지용
		popupPannel.addEventListener('click', (event)=>{
			event.stopPropagation()
		})

		isAlreadyListnerInstalled = true
	}

	currentSearchMode = 'subtitle'
	SelectModeUpdate()
	let localSubtitlesOutSide = null
	try{
		localSubtitlesOutSide = window.armyWeather.private.localAreaData.data.data.subtitles
	}catch(e){}
	manageSliderUpdate(window.armyWeather.private.SubtitleData, localSubtitlesOutSide)

	if(manageSlider === null){
		if(currentSearchMode == 'subtitle'){

			currentSearchMode = 'subtitle'
			SelectModeUpdate()
			let localSubtitlesInside  = null
			try{
				localSubtitlesInside = window.armyWeather.private.localAreaData.data.data.subtitles
			}catch(e){}
			manageSliderUpdate(window.armyWeather.private.SubtitleData, localSubtitlesInside)
	
		}else if(currentSearchMode == 'waiting'){
			/*
			API.call('/api/address',{search: ''},(paramDatas)=>{
				manageSliderUpdate(paramDatas)
			})
			*/
		}
	}

	callback = paramCallback
	window.armyWeather.util.applyColorTheme()
}