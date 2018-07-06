let geoIpData = null

export function GeoIpPreInit (){
	window.armyWeather.util.geoip = (callback)=>{

		// 이미 GPS 데이터가 있는 경우 해당 정보 반환
		if(geoIpData !== null){
			if(typeof callback == 'function') callback(geoIpData)
			return 
		}
		/*
		if (navigator.geolocation) { 
			navigator.geolocation.getCurrentPosition((position)=>{ 
				let lat = position.coords.latitude
				let lng = position.coords.longitude
			})
		}
		*/

		import('ip-to-gps').then(paramModule => {
			let getGPS = paramModule.default.getGPS
			getGPS(clientExternalIp, (err, response) => {
				geoIpData = response
				if(typeof callback == 'function') callback(geoIpData)
			})
		})
	}
}