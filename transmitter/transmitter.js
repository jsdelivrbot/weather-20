import nodeRest from 'node-rest-client'

// 클라이언트 단에서 겹치지 않는 무작위 난수 발생 코드
import fe1 from 'node-fe1-fpe'

// 선언과 동시에 REST API 인스턴스 생성
let rest = new nodeRest.Client()
let routeDomain = null

class Transmitter {
	static getDomain() {
		if(routeDomain !== null) return routeDomain
		if(typeof location != 'undefined')
			return location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '')
		return null
	}
	
	static setDomain(paramRouteDomain) {
		routeDomain = paramRouteDomain
	}

	static client() {
		return rest
	}
	
	static call(path, data, callback){
		let schema = {
			headers: {"Content-Type": "application/json"},
			data: data
		}

		rest.post(Transmitter.getDomain() + path,
			schema, (buffer, response)=>{
			callback(buffer)
		})
	}

	static encrypt(min, max, current, privateTweak, publicTweak) {
		if (current < min || current > max)
			throw new Error(`Current numebr must be between ${min} and ${max}`)
		const modulu = max - min + 1
		return fe1.encrypt(modulu, current - min, privateTweak, publicTweak) + min
	}

	static decrypt(min, max, current, privateTweak, publicTweak) {
		const modulu = max - min + 1
		return fe1.decrypt(modulu, current - min, privateTweak, publicTweak) + min
	}
}

export default Transmitter