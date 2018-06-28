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

function setByPath(obj, path, value) {
	let parts = path.split('.')
	return parts.reduce((prev, curr, ix)=>{
		return (ix + 1 == parts.length)
		? prev[curr] = value
		: prev[curr] = prev[curr] || {}
	}, obj)
}

function getByPath(obj, value) {
	let innerValue = value.replace(/\[(\w+)\]/g, '.$1')
	innerValue = innerValue.replace(/^\./, '')
	let a = innerValue.split('.')
	for (let i = 0, n = a.length; i < n; ++i) {
		let k = a[i]
		if (k in obj) 
			obj = obj[k]
		else
			return
	}
	return obj
}

export class AWSLive{
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

		database.metadata.get(`awslive.${this.option.dataId}`, (isSuccess, data)=>{
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
				let requestSchema = request.body
				if(requestSchema === undefined || requestSchema === null) {
					Logger.log(`잘못된 유형의 ${option.dataName} 요청발생`)
					response.send(null)
					response.end()
					return
				}

				if(typeof requestSchema['address'] !== 'undefined'){
					try{
						let localData = getByPath(data.data, requestSchema['address'])
						if(typeof localData['stationCode'] === 'undefined') throw new Error()
						
						response.send(localData)
						response.end()
					}catch(e){
						response.send(null)
						response.end()
					}
					return
				}

				response.send(null)
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
		database.metadata.get(`awslive.${dataId}`, (isSuccess, data)=>{

			// 데이터 유효기간 만료여부 검사
			// 2분단위
			let isNeedToUpdate = false
			if(data !== null && data !== undefined
				&& typeof data === 'object'
				&& typeof data['timestamp'] !== 'undefined' && !isNaN(data['timestamp'])){

				let downloadTime = moment(Number(data['timestamp'])).utcOffset(utc)

				// 1분이 안 지났으면
				let updateTime = moment(downloadTime).add(1, 'minutes')
				if(updateTime <= moment().utcOffset(utc)) isNeedToUpdate = true
			}

			// 기존 정상 데이터가 없는 경우 또는
			// 유효기간이 만료된 경우 최신화
			if(!isSuccess || data === null
			   || data === undefined || isNeedToUpdate){

				// encoding must be null
				request({
					uri: self.option.listPath,
					encoding: null}, (err, response, body)=>{

					try{
						body = iconv.decode(body, 'EUC-KR').toString()
						if(body == null || body == undefined || typeof body != 'string') throw new Error()
					}catch(e){
						Logger.log(`기상청에서 받은 ${dataName}의 인코딩해석에 실패했습니다.`)
						console.log(body)
					}
					Logger.log(`기상청에서 ${dataName}를 받아왔습니다.`)
					//console.log(self.option.listPath)
					//console.log(body)

					try{
						let data = {}
						let dataSheets = body.split('#999999')[1].split('</table>')[0].split('<tr')
						for(let dataSheet of dataSheets){
							dataSheet = dataSheet.split('</tr>')[0]
							if(dataSheet.indexOf(`javascript:parent.parent.menu.stn_select`) == -1)
								continue
								
							//console.log(`dataSheet: ${dataSheet}`)

							// 해석시작
							let nonParsedSubOptions = dataSheet.split(`<td`)//class=textb>
							
							let subOptions = []
							for(let subOptionsIndex in nonParsedSubOptions){
								let subOption = nonParsedSubOptions[subOptionsIndex]
								if(subOption.indexOf(`class=textb>`) == -1){
									subOption = subOption.split('>')[1].split(`</td`)[0]
								}else{
									subOption = subOption.split(`class=textb>`).join(``).split(`</td`)[0]
								}
								subOptions.push(subOption)
							}

							for(let i=1;i<=5;i++)
								subOptions.shift()

							let parsedDataSheet = {
								stationCode: dataSheet.split(`javascript:parent.parent.menu.stn_select(`)[1].split(`);`)[0],
								stationName: dataSheet.split(`);'>`)[2].split(`</a>`)[0],
								address: subOptions[15],
								rainCheck: dataSheet.indexOf(`●`) !== -1,
								rain15: subOptions[0],
								rain60: subOptions[1],
								rain3h: subOptions[2],
								rain6h: subOptions[3],
								rain12h: subOptions[4],
								rainDay: subOptions[5],
								temp: subOptions[6],
								wind1Degree: subOptions[7],
								wind1Direction: subOptions[8],
								wind1Speed: subOptions[9],
								wind2Degree: subOptions[10],
								wind2Direction: subOptions[11],
								wind2Speed: subOptions[12],
								humidity: subOptions[13],
								seaLevelPressure: subOptions[14],
							}

							let address = parsedDataSheet.address.split(' ')

							//address 가 3개이상 내려가면 3개까지만 고정
							if(address.length > 3)
								address = [address[0], address[1], address[2]]

							let addressKey = ''
							for(let addressIndex in address){
								if(addressIndex+1 == address.length) break
								if(addressIndex != 0) addressKey += '.'
								addressKey += address[addressIndex]

								if(getByPath(data, addressKey) == undefined)
									setByPath(data, addressKey, {})
							}
							setByPath(data, address.join('.'), parsedDataSheet)
							
							// console.log(parsedDataSheet)
							// console.log(JSON.stringify(data, null, 2))
							// throw new Error('중간 끊기!')
						}
						
						let dataSchema = {
							timestamp: (new Date()).getTime(),
							data,
						}
						database.metadata.set(`awslive.${dataId}`, dataSchema)
					}catch(e){
						Logger.log(`기상청에서 받아온 ${dataName}를 해석하는데 실패했습니다.`)
						console.log(e)
					}
				})
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

let listPath = `http://www.weather.go.kr/cgi-bin/aws/nph-aws_txt_min`

export function File(app, database) {
	return new AWSLive(app, database, {
		listPath,
		dataName: `전국관측소 분단위 갱신정보`,
		dataId: `awslive`,
		repeatDelay: 5000
	})
}