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

function pretty(str){
	return str.split('\r').join('').split('\n').join('').split('\t').join('')
}

export class Warning{
	constructor(app, database, option={}){
		this.isLoaded = false
		this.isLoading = false
		this.preCommandQueue = []
		this.imageUrls = []
		this.reports = {
			news: {
				title: ``,
				context: ``
			},
			info: {
				title: ``,
				context: ``
			},
			main: {
				title: ``,
				image: ``,
				context: ``
			},
			sub: {
				title: ``,
				image: ``,
				context: ``
			}
		}

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

		database.metadata.get(`warning.${this.option.dataId}`, (isSuccess, data)=>{
			callback(data)
		})
	}

	register(){
		let self = this
		let option = self.option

		if(self.intervalHandle !== null)
			clearInterval(self.intervalHandle)

		self.app.post(`/api/${option.dataId}`, (request, response)=>{
			self.get(self.database, (data)=>{
				response.send(data)
				response.end()
			})
		})

		let updateWork = ()=>{
			if(self.isLoading) return
			self.isLoading = true
			self.update(option.dataId, option.dataName, option.repeatDelay, self.database)

		}
		this.intervalHandle = setInterval(updateWork, option.repeatDelay)
		updateWork()
	}

	update(dataId, dataName, repeatDelay, database,
			callback, pageNum = null, fullData = []){

		let self = this
		database.metadata.get(`warning.${dataId}`, (isSuccess, data)=>{

			// 데이터 유효기간 만료여부 검사
			// 2분단위
			let isNeedToUpdate = false
			if(data !== null && data !== undefined
				&& typeof data === 'object'
				&& typeof data['timestamp'] !== 'undefined' && !isNaN(data['timestamp'])){

				let downloadTime = moment(Number(data['timestamp'])).utcOffset(utc)

				// 3분이 안 지났으면
				let updateTime = moment(downloadTime).add(3, 'minutes')
				if(updateTime <= moment().utcOffset(utc)) isNeedToUpdate = true
			}

			// 기존 정상 데이터가 없는 경우 또는
			// 유효기간이 만료된 경우 최신화
			if(!isSuccess || data === null
			   || data === undefined || isNeedToUpdate){

				// encoding must be null
				if(pageNum === null){
					request({
						uri: self.option.listPath,
						encoding: null}, (err, response, body)=>{

						try{
							body = iconv.decode(body, 'EUC-KR').toString()
						}catch(e){
							Logger.log(`기상청에서 받은 ${dataName}의 인코딩해석에 실패했습니다.`)
							console.log(body)
						}

						try{
							try{
								let specialReport = body.split(`class="special_report_list3"`)[1].split(`</dl>`)[0]
								self.reports.news.title = pretty(specialReport.split(`<dt>`)[1].split(`</dt>`)[0])
								self.reports.news.context = specialReport.split(`<li>`)[1].split(`</li>`)[0]
							}catch(e){}

							try{
								let specialReport = body.split(`class="special_report_list3"`)[2].split(`</dl>`)[0]
								self.reports.info.title = pretty(specialReport.split(`<dt>`)[1].split(`</dt>`)[0])
								self.reports.info.context = specialReport.split(`<li>`)[1].split(`</li>`)[0]
							}catch(e){}

							try{
								let specialReport = body.split(`class="special_report_list2"`)[1].split(`</dl>`)[0]
								self.reports.main.title = pretty(specialReport.split(`<dt>`)[1].split(`</dt>`)[0])
								self.reports.main.image = `http://www.weather.go.kr${specialReport.split(`<img src="`)[1].split(`.png`)[0]}.png`
								self.reports.main.context = specialReport.split(`<div style="display:inline-block; width:330px;">`)[1].split(`</div>`)[0]
							}catch(e){}

							try{
								let specialReport = body.split(`class="special_report_list2"`)[2].split(`</dl>`)[0]
								self.reports.sub.title = pretty(specialReport.split(`<dt>`)[1].split(`</dt>`)[0])
								self.reports.sub.image = `http://www.weather.go.kr${specialReport.split(`<img src="`)[1].split(`.png`)[0]}.png`
								self.reports.sub.context = specialReport.split(`<ul>`)[1].split(`</ul>`)[0]
							}catch(e){}

							let oldReports = ''
							try{
								oldReports = data.reports
							}catch(e){}

							let oldCheckSum = JSON.stringify(oldReports)
							let newCheckSum = JSON.stringify(self.reports)

							// 변경된 값이 존재하는 경우
							if(oldCheckSum != newCheckSum){
								Logger.log(`기상청에서 ${dataName}을 받아왔습니다. (변경점 존재)`)

								// 이미지 업데이트
								self.imageUrls.push(self.reports.main.image)
								self.imageUrls.push(self.reports.sub.image)
								self.update(dataId, dataName, repeatDelay,
									database, callback, 0, fullData)
							}else{
								let dataSchema = {
									timestamp: (new Date()).getTime(),
									reports: self.reports,
								}

								database.metadata.set(`warning.${dataId}`, dataSchema)
								// 입력되어 있는 날씨 값을 콜백에 전달합니다.
								if(typeof callback === 'function')
									callback(data)

								for(let preCommand of self.preCommandQueue)
									if(typeof preCommand === 'function')
										preCommand(data)

								self.preCommandQueue = []
								self.isLoaded = true
								self.isLoading = false
								Logger.log(`기상청에서 ${dataName}을 받아왔습니다. (변경점 없음)`)
							}

						}catch(e){
							Logger.log(`기상청에서 받아온 ${dataName}을 해석하는데 실패했습니다.`)
							console.log(e)
						}
					})
					return
				}

				let imageUrl = self.imageUrls[pageNum]
				// 이미지주소가 없으면 그냥 넘기기
				if(imageUrl.length == 0){
					if(self.imageUrls.length == (pageNum+1)){
						Logger.log(`기상청에서 ${dataName} 이미지 ${self.imageUrls.length}개를 모두 받아왔습니다.`)

						let dataSchema = {
							timestamp: (new Date()).getTime(),
							reports: self.reports,
						}

						database.metadata.set(`warning.${dataId}`, dataSchema)
						// 입력되어 있는 날씨 값을 콜백에 전달합니다.
						if(typeof callback === 'function')
							callback(data)

						for(let preCommand of self.preCommandQueue)
							if(typeof preCommand === 'function')
								preCommand(data)

						self.preCommandQueue = []
						self.isLoaded = true
						self.isLoading = false
						return
					}
					self.update(dataId, dataName, repeatDelay, database,
								callback, pageNum+1, fullData)
					return
				}
				let stream = request.get(imageUrl).pipe(fs.createWriteStream(path.join(process.cwd(), `/build/resources/gif/${dataId}_${pageNum}.gif`)))
				stream.on('finish', ()=>{
					Logger.log(`기상청에서 ${dataName} 이미지 정보를 받아왔습니다. (${pageNum+1}/${self.imageUrls.length})`)

					// 만약 이번 처리가 마지막이면
					if(self.imageUrls.length == (pageNum+1)){
						Logger.log(`기상청에서 ${dataName} 이미지 ${self.imageUrls.length}개를 모두 받아왔습니다.`)

						let dataSchema = {
							timestamp: (new Date()).getTime(),
							reports: self.reports,
						}

						database.metadata.set(`warning.${dataId}`, dataSchema)
						// 입력되어 있는 날씨 값을 콜백에 전달합니다.
						if(typeof callback === 'function')
							callback(data)

						for(let preCommand of self.preCommandQueue)
							if(typeof preCommand === 'function')
								preCommand(data)

						self.preCommandQueue = []
						self.isLoaded = true
						self.isLoading = false
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

let listPath = `http://www.weather.go.kr/weather/warning/status.jsp`

export function File(app, database) {
	return new Warning(app, database, {
		listPath,
		dataName: `특보현황 발표문`,
		dataId: `warning`,
		repeatDelay: 5000
	})
}