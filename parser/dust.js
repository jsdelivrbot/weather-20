import request from 'request'
import moment from 'moment'
import {parseString} from 'xml2js'

import path from 'path'
import fs from 'fs'
let dustPath = path.join(process.cwd(), '/parser/dust.json')

let serviceKey = ``
let requestUrl = `http://openapi.airkorea.or.kr/openapi/services/rest/MsrstnInfoInqireSvc/getMsrstnList?`
requestUrl += `serviceKey=${serviceKey}`
requestUrl += `&pageSize=10&startPage=1`


let parsedDustStationList = []
export function DustStationDataCollect(numOfRows, pageNo){
	try{
		console.log(`${pageNo*numOfRows}번째 데이터를 획득 중...`)

		// 기상청에서 해당 지역 데이터를 받아옵니다.
		request(`${requestUrl}&numOfRows=${numOfRows}&pageNo=${pageNo}`, (error, response, body) => {

			// JSON 형태로 변환합니다.
			parseString(body, (err, result) => {
				let totalCount = result.response.body[0].totalCount[0]
				let a = 0

				for(let item of result.response.body[0].items[0].item){
					a ++
					parsedDustStationList.push({
						name: item.stationName[0],
						x: item.dmX[0],
						y: item.dmY[0],
						address: item.addr[0],
						provider: item.oper[0],
						supportTypes: item.item[0].split(', '),
						dataType: item.mangName[0]
					})
				}
				console.log(`+${a}(현재 총:${parsedDustStationList.length}) 개 해석 처리함..`)

				// 아직 페이지가 남은 경우
				console.log(`${pageNo*numOfRows}번째 데이터를 획득 완료 (${Math.floor(totalCount/numOfRows)-pageNo}개 남음..)`)
				if(totalCount > (numOfRows*pageNo)){
					console.log(`요청 전 4초간 대기 중...`)

					// 5초 뒤에 요청전송
					setTimeout(()=>{
						DustStationDataCollect(numOfRows, pageNo+1)
					}, 4000)
				}else{
					console.log(`모든 데이터 수집에 완료하였습니다.`)
					fs.writeFileSync(dustPath, JSON.stringify(parsedDustStationList), 'utf-8')
				}
			})
		})
	}catch(e){
		console.log(`${pageNo*numOfRows}번째 데이터를 획득 중 오류가 발생했습니다.`)
		console.log(e)
	}
}

DustStationDataCollect(50, 1)