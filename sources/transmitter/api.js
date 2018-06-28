// 선언과 동시에 REST API 인스턴스 생성
let rest = null
let routeDomain = null

export default class API {
	static getDomain() {
		if(routeDomain !== null) return routeDomain
		if(typeof location != 'undefined')
			return location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '')
		return null
	}
	
	static setDomain(paramRouteDomain) {
		routeDomain = paramRouteDomain
	}

	static call(path, data, callback) {
		let schema = {
			headers: {"Content-Type": "application/json"},
			data: data
		}

		if(rest !== null){
			rest.post(API.getDomain() + path,
				schema, (buffer, response)=>{
				try{
					if(String(buffer) == '<h1>Internel Server Error</h1>') buffer = null
					if(String(buffer).indexOf('<title>Error</title>') != -1)  buffer = null
				}catch(e){}
				callback(buffer)
			})
			return
		}

		import('node-rest-client').then(paramModule => {
			let nodeRest = paramModule.default
			rest = new nodeRest.Client()
			rest.post(API.getDomain() + path,

				schema, (buffer, response)=>{
				try{
					if(String(buffer) == '<h1>Internel Server Error</h1>') buffer = null
					if(String(buffer).indexOf('<title>Error</title>') != -1)  buffer = null
				}catch(e){}
				callback(buffer)
			})
		})
	}
}