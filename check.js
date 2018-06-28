import path from 'path'
import fs from 'fs'


let codeJSONPath = path.join(process.cwd(), '/resources/data/code.json')
let codeData = JSON.parse(fs.readFileSync(codeJSONPath, 'utf8'))

let firstKeys = Object.keys(codeData)
let secondKeys = Object.keys(codeData['서울특별시'])
let thirdKeys = Object.keys(codeData['서울특별시']['종로구'])
let fourthKeys = codeData['서울특별시']['종로구']['혜화동']

let currentCoord = [38.0891, 127.275]
let foundedCoord = null

for(let firstLevel of Object.keys(codeData)){
	for(let secondLevel of Object.keys(codeData[firstLevel])){
		for(let thirdLevel of Object.keys(codeData[firstLevel][secondLevel])){

			let innerLevelData = codeData[firstLevel][secondLevel][thirdLevel]

			let coordDiff = 0
			coordDiff += Math.abs(currentCoord[0] - innerLevelData[2])
			coordDiff += Math.abs(currentCoord[1] - innerLevelData[1])

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

console.log(foundedCoord)

//console.log(firstKeys.length, firstKeys)
//console.log(secondKeys.length, secondKeys)
//console.log(thirdKeys.length, thirdKeys)
//console.log(fourthKeys.length, fourthKeys)