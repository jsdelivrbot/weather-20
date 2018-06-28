// 기본 IO 체계 모듈
import fs from 'fs'
import path from 'path'

// RSA 체계 모듈
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import rsaCompat from 'rsa-compat'
const rsa = rsaCompat.RSA

// FPE 체계 모듈
import fpe from 'node-fpe'
import fe1 from 'node-fe1-fpe'


class Security {

	// 프로젝트에서 사용하는 해시 함수
	static hash(passcode, callback) {
		return crypto.createHash('sha256').update(passcode).digest('base64')
	}

	// 프로젝트에서 사용하는 문자열 FPE 함수
	static encryptFPE(cipher, password){
		return fpe({ password: cipher }).encrypt(password)
	}

	static decryptFPE(encrypted, password){
		return fpe({ password: encrypted }).decrypt(password)
	}

	// 프로젝트에서 사용하는 숫자 FPE 함수
	static encryptFE1(min, max, current, privateTweak, publicTweak) {
		if (current < min || current > max)
			throw new Error(`Current numebr must be between ${min} and ${max}`)
		const modulu = max - min + 1
		return fe1.encrypt(modulu, current - min, privateTweak, publicTweak) + min
	}

	static decryptFE1(min, max, current, privateTweak, publicTweak) {
		const modulu = max - min + 1
		return fe1.decrypt(modulu, current - min, privateTweak, publicTweak) + min
	}

	// 프로젝트에서 사용하는 RSA 키생성 코드
	static createRSAKey(callback) {
		let bitlen = 2048
		let exp = 65537
		let opts = {
			public: true,
			pem: true
		}
		 rsa.generateKeypair(bitlen, exp, opts, (err, keypair) => {

			// 공개키, 비공개키 순서
			callback(keypair.publicKeyPem, keypair.privateKeyPem)
		})
		return true
	}

	// RSA 통신용 토큰 생성
	static createToken(data, privateKey) {
		return jwt.sign(data, privateKey, { algorithm: 'RS256' })
	}

	// RSA 통신용 토큰 검증
	static checkToken(encryptedTokenData, publicKey, callback) {
		jwt.verify(encryptedTokenData, publicKey, [], (error, decodedToekenData) => {
			if (error) {
				callback(false, error)
				return
			}
			callback(true, decodedToekenData)
		})
	}

}


export default Security