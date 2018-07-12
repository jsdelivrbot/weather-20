export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 쿠키값 추출
 * @param cookieName 쿠키명
 */
export function getCookie(cookieName) {
	let search = cookieName + "="
	let cookie = document.cookie

	// 현재 쿠키가 존재할 경우
	if(cookie.length > 0){
		// 해당 쿠키명이 존재하는지 검색한 후 존재하면 위치를 리턴.
		let startIndex = cookie.indexOf(cookieName)

		// 만약 존재한다면
		if(startIndex != -1){
			// 값을 얻어내기 위해 시작 인덱스 조절
			startIndex += cookieName.length

			// 값을 얻어내기 위해 종료 인덱스 추출
			let endIndex = cookie.indexOf(";", startIndex)

			// 만약 종료 인덱스를 못찾게 되면 쿠키 전체길이로 설정
			if(endIndex == -1) endIndex = cookie.length

			// 쿠키값을 추출하여 리턴
			return unescape(cookie.substring(startIndex + 1, endIndex))
		}else{
			// 쿠키 내에 해당 쿠키가 존재하지 않을 경우
			return null
		}
	}else{
		// 쿠키 자체가 없을 경우
		return null
	}
}

/**
 * 쿠키 설정
 * @param cookieName 쿠키명
 * @param cookieValue 쿠키값
 * @param expireDay 쿠키 유효날짜
 */
export function setCookie(cookieName, cookieValue, expireDate){
	if(expireDate === undefined){
		let expireDate = new Date()

		// 1000일 뒤 날짜를 쿠키 소멸 날짜로 설정합니다.
		expireDate.setDate(expireDate.getDate() + 1000)
	}
	let today = new Date()
	today.setDate(today.getDate() + parseInt(expireDate))
	document.cookie = cookieName + "=" + escape(cookieValue) + "; path=/; expires=" + today.toGMTString() + ";"
}

/**
 * 쿠키 삭제
 * @param cookieName 삭제할 쿠키명
 */
export function deleteCookie( cookieName ){
	let expireDate = new Date()

	//어제 날짜를 쿠키 소멸 날짜로 설정합니다.
	expireDate.setDate(expireDate.getDate() - 1)
	document.cookie = cookieName + "= " + "; expires=" + expireDate.toGMTString() + "; path=/"
}

export function MemoryPreInit (){
	/*
	 * 중앙화 메모리 데이터
	 */
	window.armyWeather = {
		util: {
			applyColorTheme: null,
			spinner: null,
			spinnerHide: null
		},

		private: {
			// 개인정보 목록

			//window.armyWeather.private.address.main
			address:{
				index: 1,
				gps: null,
				main: null,
				sub: []
			},

			identy:{
				uid: null,
				upw: null,
				pid: getRandomInt(0, 10000000000),
				cell: null
			},

			//window.armyWeather.private.monthlyWeatherData
			liveWeatherData: null,
			dailyWeatherData: null,
			weeklyWeatherData: null,
			monthlyWeatherData: null,

			liveDustData: null,
			dailyDustData: null,
			weeklyEnteritis: null,
			weeklyHeatdata: null,

			apiPath: `http://armyweather.run.goorm.io`,
			logined: false,
			isOverPower: false,
			isLocalPower: false,
			isAlarm: true
		},
		
		callback: {}
	}

	// 최초 호출 시 주소쿠키를 불러옵니다.
	let pastCookieData 

	pastCookieData = getCookie(`address`)
	if(pastCookieData !== null)
		try{window.armyWeather.private.address = JSON.parse(pastCookieData)}catch(e){}

	 // 3초마다 주소쿠키 저장
	let priviousSavedAddress = null
	setInterval(()=>{
		try{
			let temp = JSON.stringify(window.armyWeather.private.address)
			if(priviousSavedAddress == temp) return

			setCookie(`address`, temp)
			priviousSavedAddress = temp
		}catch(e){}
	}, 3000)


	// 최초 호출 시 주소쿠키를 불러옵니다.
	pastCookieData = getCookie(`identy`)
	if(pastCookieData !== null)
		try{window.armyWeather.private.identy = JSON.parse(pastCookieData)}catch(e){}

	 // 3초마다 개인설정 쿠키저장
	let priviousSavedIdenty = null
	setInterval(()=>{
		try{
			let temp = JSON.stringify(window.armyWeather.private.identy)
			if(priviousSavedIdenty == temp) return

			setCookie(`identy`, temp)
			priviousSavedIdenty = temp
		}catch(e){}
	}, 3000)

	// 최초 호출 시 알람쿠키를 불러옵니다.
	pastCookieData = getCookie(`alarm`)
	if(pastCookieData !== null)
		try{window.armyWeather.private.isAlarm = JSON.parse(pastCookieData)}catch(e){}

	 // 3초마다 개인설정 쿠키저장
	let priviousSavedAlarm = null
	setInterval(()=>{
		try{
			let temp = JSON.stringify(window.armyWeather.private.isAlarm)
			if(priviousSavedAlarm == temp) return

			setCookie(`alarm`, temp)
			priviousSavedAlarm = temp
		}catch(e){}
	}, 3000)
}