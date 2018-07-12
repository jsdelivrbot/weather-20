import restful from 'node-rest-client'
import Database from './database/standard/standard.js'

let Account = require('./common/account.js').Account
let Channel = require('./common/channel.js').Channel
let SubParty = require('./common/subparty.js').SubParty
let Document = require('./common/document.js').Document


// 선언과 동시에 REST API 인스턴스 생성
let rest = new restful.Client()

// (반드시 여기서 먼저 불러와야 안 터집니다.)
let Address = require('./content/address.js').default
let Weather = require('./content/weather.js').default
let Dust = require('./content/dust.js').default
let Forest = require('./content/forest.js').default

let Subtitle = require('./service/subtitle.js').default
let SubtitleWrite = require('./service/subtitle-write.js').default
let SubtitleDelete = require('./service/subtitle-delete.js').default

let WaitingList = require('./service/waiting-list.js').default
let WaitingDelete = require('./service/waiting-delete.js').default
let WaitingAuthorize = require('./service/waiting-authorize.js').default

// 지역 데이터 CRUD (Delete 는 Update에 구현)
let AuthorizeCheck = require('./service/authorize-check.js').default
let AreaDataRead =  require('./service/areadata-read.js').default
let AreaDataUpdate = require('./service/areadata-update.js').default

// 관리자 목록 및 탈퇴처리
let AdminList = require('./service/admin-list.js').default
let AdminUnregister = require('./service/admin-unregister.js').default

// 아래부터 생활정보 묶음
let Industry = require('./content/industry.js')
let Map = require('./content/map.js')
let AirQuality = require('./content/airquality.js')
let Dustmap = require('./content/dustmap.js')
let AWSLive = require('./content/awslive.js')
let CityLive = require('./content/citylive.js')
let Warning = require('./content/warning.js')

// 데이터페이스 인자
let Metadata = null
let MatadataPath = path.join(process.cwd(), '/private_data')
let MatadataFileName = 'army-weather'

// 기본 IO 모듈 불러오기
import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'

let continuable = []

function SubModuleInit(app, database){

	// 기반 최중요 API 활성화
	Address(app, database)
	Weather(app, database)
	Dust(app, database)
	Forest(app, database)

	// 자막 API 활성화
	Subtitle(app, database)
	SubtitleWrite(app, database)
	SubtitleDelete(app, database)

	// 승인대기자 API 활성화
	WaitingList(app, database)
	WaitingDelete(app, database)
	WaitingAuthorize(app, database)

	// 관리자 허용여부 API 활성화
	AuthorizeCheck(app, database)

	// 지역 푸시정보 갱신 API 활성화
	AreaDataUpdate(app, database)

	// 지역 푸시정보 정보전송 API 활성화
	AreaDataRead(app, database)


	// 관리자 목록 조회 API 활성화
	AdminList(app, database)
	AdminUnregister(app, database)


	// 계정 API 활성화
	Account(app, database)

	// 채널 API 활성화
	Channel(app, database)

	// 모임 API 활성화
	SubParty(app, database)

	// 게시글 API 활성화
	Document(app, database)
}

// 데이터베이스가 정의되지 않은 경우
let DatabaseInit = (app)=>{
	Metadata = new Database(MatadataPath, MatadataFileName, (isSuccess, database)=>{
		SubModuleInit(app, database)

		continuable.push(Industry.Heatdata(app, database))    // 온도지수
		continuable.push(Industry.Enteritis(app, database))   // 식중독지수
		continuable.push(Industry.UV(app, database))          // 자외선지수
		continuable.push(Industry.Discomfort(app, database))  // 불쾌지수
		continuable.push(Industry.HeatIndex(app, database))   // 열지수

		continuable.push(Industry.Asthma(app, database))      // 천식폐질환지수
		continuable.push(Industry.Stroke(app, database))      // 뇌졸중가능지수

		continuable.push(Map.Temp(app, database))
		continuable.push(Map.TempMax(app, database))
		continuable.push(Map.RainAmount(app, database))
		continuable.push(Map.Rain(app, database))
		continuable.push(Map.Sky(app, database))
		continuable.push(Map.Wave(app, database))
		continuable.push(Map.Humidity(app, database))

		continuable.push(Dustmap.Gif(app, database))
		continuable.push(AirQuality.File(app, database))

		continuable.push(AWSLive.File(app, database))
		continuable.push(CityLive.File(app, database))
		continuable.push(Warning.File(app, database))
	})

	// global 변수에 추가
	global.Metadata = Metadata
}

// API Receiver 서버의 처리 구현단
class Receiver {
	static getRest(){
		return rest
	}

	static init (app){
		// 데이터베이스가 아직 초기화 되지 않았다면
		if(Metadata === null){

			// 데이터베이스 경로생성
			if(!fs.existsSync(MatadataPath)){
				mkdirp(MatadataPath, ()=>{DatabaseInit(app)})
				return
			}

			// 데이터베이스 초기화 진행
			DatabaseInit(app)
		}else{
			let database = Metadata

			SubModuleInit(app, database)
			for (let continuableObject of continuable)
				continuableObject.change(app)
		}
	}
}
export default Receiver