import path from 'path'
import fs from 'fs'

let tab = `	`

console.log(`코드를 읽어오기 시작합니다.`)
let codePath = path.join(process.cwd(), '/code.txt')
let codeJSONPath = path.join(process.cwd(), '/code.json')
let codeData = fs.readFileSync(codePath, 'utf8')

console.log(`코드를 분류하기 시작합니다.`) // 104만개 존재해야함
let parsedCodeDatas = codeData.split(`\r\n`)

console.log(`${parsedCodeDatas.length} 개 코드를 읽어왔습니다.`)

let result = {}
for(let parsedCodeDataIndex in parsedCodeDatas){
	let data = parsedCodeDatas[parsedCodeDataIndex].split(tab)

	// 각 단계가 없으면 생성
	if(typeof result[data[1]] === 'undefined')
		result[data[1]] = {}
	if(typeof result[data[1]][data[2]] === 'undefined')
		result[data[1]][data[2]] = {}
	if(typeof result[data[1]][data[2]][data[3]] === 'undefined')
		result[data[1]][data[2]][data[3]] = {}

	// 0 행정구역코드
	// 1 long
	// 2 lat
	result[data[1]][data[2]][data[3]] = [data[0], data[4], data[5]]
}

console.log(`분류작업이 완료되었습니다. 저장을 시작합니다..`)
fs.writeFileSync(codeJSONPath, JSON.stringify(result), 'utf-8')

// 0 행정구역코드
// 1 1단계
// 2 2단계
// 3 3단계
// 4 경도 long
// 5 위도 lat