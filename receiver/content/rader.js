import request from 'request'
import Logger from '../../logger.js'
import iconv from 'iconv-lite'
import moment from 'moment'
import fs from 'fs'

import {findAddress} from './address.js'

import {PNG} from 'node-png'
import GIFEncoder from 'gifencoder'
import pngFileStream from 'png-file-stream'

let utc = '+0900'
import path from 'path'

export class DustMap{
	constructor(app, database, option={}){
		this.isLoaded = false
		this.isLoading = false
		this.preCommandQueue = []
		this.pageUrls = []
		this.imageUrls = []

		this.app = app
		this.database = database
		this.option = option

		this.intervalHandle = null
		this.dataJson = null
		this.register()
	}
	
	change(paramApp){
		this.app = paramApp
		this.register()
	}

	get(database, callback){
		if(!this.isLoaded){
			this.preCommandQueue.push(callback)
			return
		}

		database.metadata.get(`dustmap.${this.option.dataId}`, (isSuccess, data)=>{
			callback(data)
		})
	}

	register(){
		let self = this
		let option = self.option

		if(self.intervalHandle !== null)
			clearInterval(self.intervalHandle)

		this.intervalHandle = setInterval(()=>{
			if(self.isLoaded || self.isLoading) return
			self.isLoading = true
			self.update(option.dataId, option.dataName, option.repeatDelay, self.database)

		}, option.repeatDelay)
	}

	update(dataId, dataName, repeatDelay, database,
			callback, pageNum = null, fullData = []){

		let self = this
		database.metadata.get(`dustmap.${dataId}`, (isSuccess, data)=>{

			// 데이터 유효기간 만료여부 검사
			let isNeedToUpdate = false
			if(data !== null && data !== undefined
			   && typeof data === 'object'
			   && typeof data['timestamp'] !== 'undefined' && !isNaN(data['timestamp'])){

				let downloadTime = moment(Number(data['timestamp'])).utcOffset(utc)

				// 18일 01시에 받았는데 19일 07시 까지 대기할 수 있으므로,
				// 18일 01시는 17일01시로 책정, 그러면 18일 07시에 정상작동함
				if(downloadTime.get('hour') < self.option.updateHour)
					downloadTime.add(-1, 'days')

				// 데이터 다운로드 시점의 일로부터
				// 다음날 07시가 오늘보다 과거면 업데이트 true
				let updateTime = moment(downloadTime).add(1, 'days').set('hour', self.option.updateHour).set('minute', 0).set('second', 0)
				if(updateTime <= moment().utcOffset(utc)) isNeedToUpdate = true
			}

			// 기존 정상 데이터가 없는 경우 또는
			// 유효기간이 만료된 경우 최신화
			if(!isSuccess || data === null
			   || data === undefined || isNeedToUpdate){

				// 최초 pageNum 이 pageNum일 때만
				// 해당 일자 최신 이미지 목록 획득
				if(pageNum === null){

					request({
						url: self.option.listPath,
						headers: {
							'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
							'Accept-Encoding': 'gzip, deflate',
							'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36'
						}
					} , (err, response, body)=>{
						body = String(body)
						Logger.log(`한국환경공단에서 ${dataName} 지도화용 목록정보를 받아왔습니다.`)
						//console.log(body)

						try{
							let imgUrls = body.split(`<a class="popup-layer" href="http://www.airkorea.or.kr/file/viewImage2/?fileNm=dust/`)
							//console.log(body.split(`<a class="popup-layer" href="http://www.airkorea.or.kr/file/viewImage2/?fileNm=dust/`).length)
							//console.log(body.split(`<a class="popup-layer" href="http://www.airkorea.or.kr/file/viewImage2/?fileNm=dust/`))
							imgUrls.shift()

							//console.log(body)
							//return
							for(let imgUrl of imgUrls){
								let innerUrl = `http://www.airkorea.or.kr/file/viewImage2/?fileNm=dust/${imgUrl.split(`">`)[0]}`
								//console.log(`innerUrl: ${innerUrl}`)
								self.pageUrls.push(innerUrl)
							}

							self.update(dataId, dataName, repeatDelay,
										database, callback, 0, fullData)
						}catch(e){
							Logger.log(`한국환경공단에서 받아온 ${dataName} 지도화용 목록정보를 해석하는데 실패했습니다.`)
							console.log(e)
						}
					})
					return
				}

				let processUrl = self.pageUrls[pageNum]
				//Logger.log(`processUrl: ${processUrl}`)
				let stream = request.get({
					url: processUrl,
					headers: {
						'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
						'Accept-Encoding': 'gzip, deflate',
						'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36'
					}
				}).pipe(fs.createWriteStream(path.join(process.cwd(), `/build/resources/gif/${dataId}_${pageNum}.gif`)))

				stream.on('finish', ()=>{
					Logger.log(`한국환경공단에서 ${dataName} 이미지를 받아왔습니다. (${pageNum+1}/${self.pageUrls.length})`)

					if(self.pageUrls.length == (pageNum+1)){
						Logger.log(`한국환경공단에서 ${dataName} 이미지를 모두 받아왔습니다.`)
						let dataSchema = {
							timestamp: (new Date()).getTime(),
							pageUrls: self.pageUrls,
						}
						database.metadata.set(`dustmap.${dataId}`, dataSchema)
						return
					}

					setTimeout(()=>{
						self.update(dataId, dataName, repeatDelay, database,
									callback, pageNum+1, fullData)
					}, repeatDelay)
				})
				return
			}

			// 입력되어 있는 날씨 값을 콜백에 전달합니다.
			if(typeof callback === 'function')
				callback(data)

			for(let preCommand of self.preCommandQueue)
				if(typeof preCommand === 'function')
					preCommand(data)

			self.preCommandQueue = []
			self.isLoaded = true
			self.isLoading = false
		})
	}
}

let listPath = `http://www.airkorea.or.kr/dustForecast`

export function Gif(app, database) {
	return new Rader(app, database, {
		listPath,
		dataName: `레이더 이미지`,
		dataId: `dustgif`,
		updateHour: 6
	})
}