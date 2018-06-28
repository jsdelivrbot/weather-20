let geoIpData = null

export function GeoIpPreInit (){
	window.armyWeather.util.geoip = (callback)=>{
		if(geoIpData !== null){
			if(typeof callback == 'function') callback(geoIpData)
			return 
		}

		import('ip-to-gps').then(paramModule => {
			let getGPS = paramModule.default.getGPS
			getGPS(clientExternalIp, (err, response) => {
				geoIpData = response
				if(typeof callback == 'function') callback(geoIpData)
			})
		})
	}
}