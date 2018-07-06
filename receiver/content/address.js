import path from 'path'
import fs from 'fs'

let codeJSONPath = path.join(process.cwd(), '/resources/data/code.json')
let codeData = JSON.parse(fs.readFileSync(codeJSONPath, 'utf8'))

let koreaRootAddress = {
	서울: [37.56356944444444, 126.98000833333333],
	제주: [33.48569444444445, 126.50033333333333],
	전남: [34.813044444444444, 126.465],
	전북: [35.81727, 127.11105277777777],
	광주: [35.156974999999996, 126.85336388888888],
	경남: [35.23473611111111, 128.69416666666666],
	경북: [35.889605555555555, 128.60276666666667],
	울산: [35.53540833333333, 129.3136888888889],
	대구: [35.868541666666665, 128.60355277777776],
	부산: [35.17701944444444, 129.07695277777776],
	충남: [36.32387222222223, 127.42295555555556],
	충북: [36.6325, 127.49358611111111],
	세종: [36.4800121, 127.2890691],
	대전: [36.347119444444445, 127.38656666666667],
	인천: [37.45323333333334, 126.70735277777779],
	경기남부: [37.274655, 127.009526],
	경기북부: [37.750768, 127.071535]
}

//http://www.weather.go.kr/weather/forecast/mid-term-rss3.jsp?stnId=108
// 서울 인천 수원 파주 춘천 원주 강릉 대전 세종 홍성 청주 광주 목포 여수 전주 군산 부산 울산 창원 대구 안동 포항 제주 서귀포
let koreaRootDetailAddress = {
	서울: [37.56356944444444, 126.98000833333333],
	인천: [37.45323333333334, 126.70735277777779],
	수원: [37.263435, 127.02858],
	파주: [37.756577, 126.786926],
	춘천: [37.858791, 127.73571],
	원주: [37.344742, 127.948631],
	강릉: [37.751885, 128.876066],
	대전: [36.347119444444445, 127.38656666666667],
	세종: [36.4800121, 127.2890691],
	홍성: [36.590061, 126.670738],
	청주: [36.641903, 127.488751],
	광주: [35.156974999999996, 126.85336388888888],
	목포: [34.796856, 126.394417],//
	여수: [34.734928, 127.743767],
	전주: [35.824213, 127.147998],
	군산: [35.967634, 126.736836],
	부산: [35.17701944444444, 129.07695277777776],
	울산: [35.538270, 129.313300],
	창원: [35.254421, 128.626678],//
	대구: [35.868541666666665, 128.60355277777776],
	안동: [35.235645, 128.913528],
	포항: [36.037868, 129.366272],
	제주: [33.512161, 126.525734],
	서귀포: [33.252820, 126.561100]
}

//let exampleCode = `서울 : 보통,제주 : 좋음,전남 : 보통,전북 : 보통,광주 : 보통,경남 : 보통,경북 : 좋음,울산 : 좋음,대구 : 좋음,부산 : 좋음,충남 : 보통,충북 : 좋음,세종 : 좋음,대전 : 좋음,영동 : 좋음,영서 : 좋음,경기남부 : 보통,경기북부 : 보통,인천 : 보통`

export default function Address(app, database) {
	app.post(`/api/address`, (request, response)=>{
		let requestSchema = request.body
		if(requestSchema === undefined || requestSchema === null) {
			console.log(`잘못된 유형의 주소요청 발생`)
			response.send(null)
			response.end()
			return
		}

		// 검색 요청이 있는 경우 검색 값 출력
		//searchAddress
		if(typeof requestSchema['search'] != 'undefined'){
			let searchTarget = [] 
			try{
				searchTarget = requestSchema['search'].split(' ')
			}catch(e){}

			let foundedCoord = searchAddress(searchTarget)
			response.send({data: foundedCoord})
			response.end()
			return
		}


		// 좌표 요청이 있는 경우 해당좌표에 가장 근접한 지역정보값 표시
		if(typeof requestSchema['coord'] != 'undefined'){

			let foundedCoord = findAddress(requestSchema['coord'][0], requestSchema['coord'][1])
			response.send({
				isLast: true,
				data: foundedCoord})
			response.end()
			return
		}

		// 키 값이 없는 경우 최상위 주소목록 전송
		if(typeof requestSchema['key'] == 'undefined'){
			response.send({
				isLast: false,
				data: Object.keys(codeData)})
			response.end()
			return
		}

		let paramKey = requestSchema['key']
		let isLast = false

		if(paramKey.split('.').length >= 3)
			isLast = true

		let foundedData = null
		try{ foundedData = isLast ?
			getByPath(codeData, paramKey) : Object.keys(getByPath(codeData, paramKey)) 
		} catch(e){}

		response.send({
			isLast: isLast,
			data: foundedData})
		response.end()
	})

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

export function getAddressData(paramKey){
	let result = null
	try{
		result = getByPath(codeData, paramKey)
	}catch(e){}
	return result
}

export function searchAddress(keywords){
	let foundedAddress = []
	for(let firstLevel of Object.keys(codeData)){
		for(let secondLevel of Object.keys(codeData[firstLevel])){
			for(let thirdLevel of Object.keys(codeData[firstLevel][secondLevel])){

				let key = `${firstLevel} ${secondLevel} ${thirdLevel}`
				let innerLevelData = codeData[firstLevel][secondLevel][thirdLevel]

				let isMatched = true
				for(let keyword of keywords){
					if(key.indexOf(keyword) === -1){
						isMatched = false
						break
					}
				}

				// 찾는 값일 때만 추가
				if(isMatched){
					innerLevelData.push(`${firstLevel}.${secondLevel}.${thirdLevel}`)
					foundedAddress.push(innerLevelData)
				}
				
				// 만약 50개가 넘어갔으면 중단
				if(foundedAddress.length >= 50) return foundedAddress
			}
		}
	}
	return foundedAddress
}

export function findAddress(paramLat, paramLong){
	let lat = Number(paramLat)
	let long = Number(paramLong)

	let foundedCoord = null
	for(let firstLevel of Object.keys(codeData)){
		for(let secondLevel of Object.keys(codeData[firstLevel])){
			for(let thirdLevel of Object.keys(codeData[firstLevel][secondLevel])){

				let innerLevelData = codeData[firstLevel][secondLevel][thirdLevel]

				let coordDiff = 0
				coordDiff += Math.abs(lat - innerLevelData[2])
				coordDiff += Math.abs(long - innerLevelData[1])

				// 아직 찾은 좌표가 하나도 없거나
				// 비교대상보다 좌표비교값이 더 작으면
				if(foundedCoord === null || foundedCoord.diff > coordDiff){
					foundedCoord = {
						diff: coordDiff,
						cell: innerLevelData[0],
						long: innerLevelData[1],
						lat: innerLevelData[2],
						key: `${firstLevel}.${secondLevel}.${thirdLevel}`
					}
				}
			}
		}
	}
	if(typeof foundedCoord['diff'] !== 'undefined')
		delete foundedCoord['diff']
	return foundedCoord
}

export function findRootAddress(paramLat, paramLong){
	let lat = Number(paramLat)
	let long = Number(paramLong)

	let foundData = null

	for(let rootAddressName in koreaRootAddress){
		let rootAddress = koreaRootAddress[rootAddressName]

		let coordDiff = 0
		coordDiff += Math.abs(lat - rootAddress[0])
		coordDiff += Math.abs(long - rootAddress[1])

		if(foundData === null || foundData.diff > coordDiff){
			foundData = {
				name: rootAddressName,
				x: rootAddress[0],
				y: rootAddress[1],
				diff: coordDiff
			}
		}
	}
	return foundData.name
}

export function findRootDetailAddress(paramLat, paramLong){
	let lat = Number(paramLat)
	let long = Number(paramLong)

	let foundData = null

	for(let rootAddressName in koreaRootDetailAddress){
		let rootAddress = koreaRootDetailAddress[rootAddressName]

		let coordDiff = 0
		coordDiff += Math.abs(lat - rootAddress[0])
		coordDiff += Math.abs(long - rootAddress[1])

		if(foundData === null || foundData.diff > coordDiff){
			foundData = {
				name: rootAddressName,
				x: rootAddress[0],
				y: rootAddress[1],
				diff: coordDiff
			}
		}
	}
	return foundData.name
}