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

let isGlobalUpdateQueueRunning = false
let globalUpdateQueue = []

// 생활지수 정보 크롤러
export class Map{
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

		database.metadata.get(`mapdata.${this.option.dataId}`, (isSuccess, data)=>{
			callback(data)
		})
	}

	register(){
		let self = this
		let option = self.option

		if(self.intervalHandle !== null)
			clearInterval(self.intervalHandle)

		this.intervalHandle = setInterval(()=>{
			if(self.isLoading) return
			self.isLoading = true
			
			if(!isGlobalUpdateQueueRunning){
				//isGlobalUpdateQueueRunning = true
				self.update(option.dataId, option.dataName, option.repeatDelay, self.database)
			}else{
				globalUpdateQueue.push(()=>{
					self.update(option.dataId, option.dataName, option.repeatDelay, self.database)
				})
			}
		}, option.repeatDelay)
	}

	update(dataId, dataName, repeatDelay, database,
			callback, pageNum = null, fullData = [], type='url'){

		let self = this
		database.metadata.get(`mapdata.${dataId}`, (isSuccess, data)=>{

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
						uri: `${self.option.listPath}&data1=${self.option.dataType}`,
						rejectUnauthorized: false,
						encoding: null

					}, (err, response, body)=>{
						body = String(body)
						Logger.log(`기상청에서 ${dataName} 지도화용 목록정보를 받아왔습니다.`, `[Backend:Map]`)

						try{
							let fcttype = body.split(`var fcttype = '`)[1].split(`';`)[0]
							let tm_fc = body.split(`var tm_fc = '`)[1].split(`';`)[0]
							let data1 = body.split(`var data1 = '`)[1].split(`';`)[0]
							let mapName = body.split(`var map = '`)[1].split(`';`)[0]
							let zoom_x = body.split(`var zoom_x = '`)[1].split(`';`)[0]
							let zoom_y = body.split(`var zoom_y = '`)[1].split(`';`)[0]
							let overlay = body.split(`var overlay = '`)[1].split(`';`)[0]

							let preTmEfs = body.split(`onclick="tm_ef_select('`)
							preTmEfs.shift()

							for(let preTmEf of preTmEfs){
								let tm_ef = preTmEf.split(`');`)[0]
								let innerUrl = 'http://www.weather.go.kr/cgi-bin/dfs/nph-dfs_now2?fcttype=' + fcttype + '&data1=' + data1 + '&tm_fc=' + tm_fc + '&tm_ef=' + tm_ef + '&map=' + mapName + '&zoom_x=' + zoom_x + '&zoom_y=' + zoom_y + '&overlay=' + overlay + '&size=' + 500 + '&ctrl=' + 0
								self.pageUrls.push(innerUrl)
							}

							self.update(dataId, dataName, repeatDelay,
										database, callback, 0, fullData, type)
						}catch(e){
							Logger.log(`기상청에서 받아온 ${dataName} 지도화용 목록정보를 해석하는데 실패했습니다.`, `[Backend:Map]`)
							console.log(e)
							console.log('전문:')
							console.log(body)
						}
					})
					return
				}

				if(type === 'url'){
					let processUrl = self.pageUrls[pageNum]
					//Logger.log(`processUrl: ${processUrl}`)
					request({
						uri: `${processUrl}`,
						rejectUnauthorized: false,
						encoding: null

					}, (err, response, body)=>{
						body = String(body)

						Logger.log(`기상청에서 ${dataName} 페이지 정보를 받아왔습니다. (${pageNum+1}/${self.pageUrls.length})`, `[Backend:Map]`)
						//console.log(`body length: ${body.length}`)
						//console.log(`body: ${body}`)

						// 값 해석을 시작합니다.
						let imageUrl = null
						try{
						imageUrl = `http://www.weather.go.kr/img/dfs/` + body.split(`/img/dfs/`)[1].split(`' border=0`)[0]
						}catch(e){
							Logger.log(`${dataName} 페이지정보 획득 중 (${pageNum+1}/${self.pageUrls.length}) 번째 페이지에서 알 수 없는 값을 받았습니다.`, `[Backend:Map]`)
							console.log(body)
						}
						if(imageUrl !== null)
							self.imageUrls.push(imageUrl)

						// 만약 이번 처리가 마지막이면
						if(self.pageUrls.length == (pageNum+1)){
							Logger.log(`기상청에서 ${dataName} 페이지 정보를 모두 받아왔습니다.`, `[Backend:Map]`)

							self.update(dataId, dataName, repeatDelay,
										database, callback, 0, fullData, 'img')
							return
						}

						setTimeout(()=>{
							self.update(dataId, dataName, repeatDelay, database,
										callback, pageNum+1, fullData, type)
						}, repeatDelay)
					})
				}
				
				if(type === 'img'){
					let imageUrl = self.imageUrls[pageNum]
					//Logger.log(`imageUrl: ${imageUrl}`)

					//let stream = request.get(imageUrl).pipe(fs.createWriteStream(`./private_data/image/${dataId}_${pageNum}.png`))
					request.get(imageUrl).pipe(new PNG()).on('parsed', function (){
						for (let y = 0; y < this.height; y++) {
							for (let x = 0; x < this.width; x++) {
								let idx = (this.width * y + x) << 2

								// 회색을 흰색으로 필터적용
								if(this.data[idx] == 210 && this.data[idx+1] == 210 && this.data[idx+2] == 210){
									this.data[idx] = 255
									this.data[idx+1] = 255
									this.data[idx+2] = 255
								}
							}
						}
						
						let pageNumGIF = String(pageNum)
						if(pageNumGIF.length == 1) pageNumGIF = `0${pageNumGIF}`
						let stream = this.pack().pipe(fs.createWriteStream(`./private_data/image/${dataId}_${pageNumGIF}.png`))
						stream.on('finish', ()=>{
							Logger.log(`기상청에서 ${dataName} 이미지 정보를 받아왔습니다. (${pageNum+1}/${self.imageUrls.length})`, `[Backend:Map]`)

							// 만약 이번 처리가 마지막이면
							if(self.imageUrls.length == (pageNum+1)){
								Logger.log(`기상청에서 ${dataName} 이미지 ${self.imageUrls.length}개를 모두 받아왔습니다.`, `[Backend:Map]`)
								Logger.log(`${dataName} 이미지 ${self.imageUrls.length}개를 GIF화 진행 중...`, `[Backend:Map]`)

								//GIF 렌더링 시작
								let encoder = new GIFEncoder(536, 877)
								let gifWriteStream = 
									pngFileStream(`./private_data/image/${dataId}_??.png`)
									.pipe(encoder.createWriteStream({ repeat: 0, delay: self.option.gifDelay, quality: 30 }))
									.pipe(fs.createWriteStream(path.join(process.cwd(), `/build/resources/gif/${dataId}.gif`)))

								gifWriteStream.on('finish', ()=>{
									Logger.log(`${dataName} 이미지 ${self.imageUrls.length}개를 GIF화 완료했습니다.`, `[Backend:Map]`)

									let dataSchema = {
										timestamp: (new Date()).getTime(),
										link: path.join(process.cwd(), `/build/resources/gif/${dataId}.gif`)
									}
									database.metadata.set(`mapdata.${dataId}`, dataSchema)
									self.isLoaded = true
									self.isLoading = false

									// 모든 글로벌 업데이트가 끝났다면
									if(globalUpdateQueue.length == 0){
										isGlobalUpdateQueueRunning = false
										return
									}

									// 글로벌 업데이트가 남아있다면
									let nextUpdateWork = globalUpdateQueue.shift()
									nextUpdateWork()
								})

								return
							}

							setTimeout(()=>{
								self.update(dataId, dataName, repeatDelay, database,
											callback, pageNum+1, fullData, type)
							}, repeatDelay)
						})
						
					})
				}
			}else{
				self.isLoaded = true
				self.isLoading = false
			}

			// 입력되어 있는 날씨 값을 콜백에 전달합니다.
			if(typeof callback === 'function')
				callback(data)

			for(let preCommand of self.preCommandQueue)
				if(typeof preCommand === 'function')
					preCommand(data)

			self.preCommandQueue = []
		})
	}
}

let listPath = `http://www.weather.go.kr/cgi-bin/dfs/nph-dfs_now2?map=G1&size=500&auto=a&effect=G&mode=H` //&data1=T3H
let imgPath = `http://www.weather.go.kr/img/`
let dataPath = `http://www.weather.go.kr/cgi-bin/dfs/nph-dfs_now2`

export function Temp(app, database) {
	return new Map(app, database, {
		listPath, dataPath, imgPath,
		dataName: `기온지도`,
		dataType: `T3H`,
		dataId: `temp`,
		updateHour: 7,
		gifDelay: 5000,
		repeatDelay: 5000,
	})
}

export function TempMax(app, database) {
	return new Map(app, database, {
		listPath, dataPath, imgPath,
		dataName: `최고기온지도`,
		dataType: `TMX`,
		dataId: `tempmax`,
		updateHour: 7,
		gifDelay: 1000,
		repeatDelay: 5000,
	})
}

export function RainAmount(app, database) {
	return new Map(app, database, {
		listPath, dataPath, imgPath,
		dataName: `강수량지도`,
		dataType: `R06`,
		dataId: `rainamount`,
		updateHour: 7,
		gifDelay: 5000,
		repeatDelay: 5000,
	})
}

export function Rain(app, database) {
	return new Map(app, database, {
		listPath, dataPath, imgPath,
		dataName: `강수확률지도`,
		dataType: `POP`,
		dataId: `rain`,
		updateHour: 7,
		gifDelay: 5000,
		repeatDelay: 5000,
	})
}

export function Sky(app, database) {
	return new Map(app, database, {
		listPath, dataPath, imgPath,
		dataName: `하늘상태지도`,
		dataType: `SKY`,
		dataId: `sky`,
		updateHour: 7,
		gifDelay: 5000,
		repeatDelay: 5000,
	})
}

export function Wave(app, database) {
	return new Map(app, database, {
		listPath, dataPath, imgPath,
		dataName: `전국파고지도`,
		dataType: `WAV`,
		dataId: `wave`,
		updateHour: 7,
		gifDelay: 5000,
		repeatDelay: 5000,
	})
}

export function Humidity(app, database) {
	return new Map(app, database, {
		listPath, dataPath, imgPath,
		dataName: `전국습도지도`,
		dataType: `REH`,
		dataId: `humidity`,
		updateHour: 7,
		gifDelay: 5000,
		repeatDelay: 5000,
	})
}