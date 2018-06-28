// 기본 IO 체계 모듈
import fs from 'fs'
import path from 'path'
import logger from '../logger.js'
import security from './security.js'

class SSL {
	contructor(userPublickey, serverPrivateKey){
		this.userPublicKey = userPublickey
		this.serverPrivateKey = serverPrivateKey
	}

	decode (paramToken, callback) {
		try{
			security.checkToken(
				paramToken,
				this.userPublicKey,	
				(isSuccess, data) => { callback(isSuccess, data) })
		}catch(error){
			callback(false, error)
		}
	}

	encrypt (paramData, callback) {
		return security.createToken(
			JSON.stringify(paramData),
			this.serverPrivateKey
		)
	}

	createRandomkey () {
		let min = 0
		let max = 99999999999
		return Math.random() * (max - min) + min
	}
	
	receive (request, response, callback) {
		this.decode(request.body.token, (isSuccess, data) => {
			if(!isSuccess){
				callback(false)
				response.send(false)
				response.end()
				return
			}
			callback(true, data)
		})
	}

	send (response, data, callback) {
		let token = null
		let isSuccess = true

		try {
			token = this.encrypt(data)
		} catch(error) {
			isSuccess = false
		}
		
		if(typeof callback === 'function')
			callback(isSuccess, token)

		response.send(JSON.stringify({
			headers: { 'Content-Type': 'application/json' },
			data: token
		}))
	}
}

export default SSL