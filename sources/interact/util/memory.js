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
				main: null,
				sub: []
			},
	
			//window.armyWeather.private.monthlyWeatherData
			liveWeatherData: null,
			dailyWeatherData: null,
			weeklyWeatherData: null,
			monthlyWeatherData: null,

			liveDustData: null,
			dailyDustData: null,
			weeklyEnteritis: null,
			weeklyHeatdata: null
		}
	}
}