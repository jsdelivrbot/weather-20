// 기본 IO 체계 모듈
import readline from 'readline'
import path from 'path'
import fs from 'fs'
import fse from 'fs-extra'

// EXPRESS 모듈
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import receiver from './receiver/receiver.js'
import killable from 'killable'
import timeout from 'connect-timeout'
import restify from 'restify'

// 웹팩 자동화 빌드 모듈
import webpack from 'webpack'
const configuration = require('./webpack.config.js')

// 로거 연결
import logger from './logger.js'


// 디버깅 도메인 주소
var domain = 'http://armyweather.run.goorm.io'
let transmitter = null

// 빌드 파일 폴더 생성
const buildPath = __dirname + '/build'
if (!fs.existsSync(buildPath)) fs.mkdirSync(buildPath)

var app = null
var server = null

function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
}

// 폴더 내부 검색
export function nestedDirectorySearch (originPath, subPath, staticPath, callback){
	let files = fs.readdirSync(staticPath)

	for(let file of files){
		fs.stat(staticPath + '/' + file, (error, stats)=>{
			if(error || !stats.isDirectory()) {
				callback(subPath, staticPath, file)
				return
			}
			nestedDirectorySearch(originPath, subPath + file + '/', staticPath+ '/' + file, callback)
		})
	}
}

var startServer = ()=> {
	app = express()

	//app.use(timeout('5s'))

	// APP BODY해석기 추가
	app.use(bodyParser.urlencoded({
		extended: true
	}))
	//app.use(haltOnTimedout)

	app.use(bodyParser.json())
	//app.use(haltOnTimedout)

	// APP CORS 정책 허용
	app.use(cors())

	// APP 정적 데이터 불러오기
	app.use(express.static(buildPath))


	// build 내부 폴더들을 링크로 지원하게 설정
	nestedDirectorySearch('/', '/', buildPath, (subPath, staticPath)=>{
		// logger.log (`리소스 연동완료 ${staticPath} to ${subPath}`)
		// logger.log (`리소스 연동완료 ${subPath}`)
		app.use(subPath, express.static(staticPath))
	})

	// APP 접속 경로 생성
	server = app.listen(80, ()=>{
		logger.log('ARMY-WEATHER 서비스 활성화 되었습니다.\n')
		logger.log('현재 연결되어있는 앱 도메인:')
		logger.log(domain + '\n')
	})
	killable(server)

	
	logger.log('RECEIVER 모듈 활성화 중....')

	// APP API Receiver 사용
	receiver.init(app)

	logger.log('RECEIVER 모듈 활성화 완료....')
	console.log(' ')

	logger.log('TRANSMITTER 모듈 활성화 중....')
	transmitter = require('./transmitter/transmitter.js').default
	logger.log('TRANSMITTER 모듈 도메인 설정 중....')
	transmitter.setDomain(domain)
	logger.log('TRANSMITTER 모듈 도메인 설정 완료....')
	logger.log(`(${transmitter.getDomain()} 로 설정됨)\n`)
	logger.log('TRANSMITTER 모듈 활성화 완료....')
}

var refreshServer = ()=> {
	logger.log('ARMY-WEATHER 서비스 재부팅을 진행합니다...')

	if(server !== null){
		logger.log('ARMY-WEATHER 서비스 재부팅 요청을 전송합니다.')
		server.kill(()=>{
			server = null
			app = null

			startServer()
			logger.log('ARMY-WEATHER 서비스 재부팅이 완료되었습니다.')
		})
		return
	}
	server = null
	app = null
	
	startServer()
	logger.log('ARMY-WEATHER 서비스 재부팅이 완료되었습니다.')
}

let compiler = webpack(configuration)
let start = (error, data) => {
	logger.log('ARMY-WEATHER 서비스 활성화를 진행합니다...')
	
	startServer()

	const line = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	})

	line.on('line', (input) => {
		//let commandName = input.toLowerCase().split(' ')[0]
		let commandArgs = input.split(' ')
		let commandName = commandArgs.shift()
		let commandFolderPath = path.join(process.cwd(), '/command/')

		switch (commandName) {
		case 'refresh':
			logger.log('앱 디자인파일 업데이트를 진행합니다...')

			fse.copy(__dirname + '/sources/index.html', __dirname + '/build/index.html', (error) => {
				if (error){
					logger.log('앱 HTML 업데이트 과정에서 에러가 발생하였습니다.')
					logger.log(error)
					return
				}
				logger.log('앱 HTML 파일 업데이트를 완료하였습니다.')

				fse.copy(__dirname + '/resources', __dirname + '/build/resources', (error) => {
					if (error){
						logger.log('앱 CSS 업데이트 과정에서 에러가 발생하였습니다.')
						logger.log(error)
					}
					logger.log('앱 CSS 파일 업데이트를 완료하였습니다.\n')
					refreshServer()
				})
			})

			break
		case 'update':
			logger.log('앱 재생성을 진행합니다...')
			compiler.run((error, stats)=>{
				if(error != null){
					logger.log('앱 재생성 과정에서 에러가 발생하였습니다.')
					logger.log(error)
					return
				}
				logger.log(stats)
				logger.log('앱 재생성을 완료하였습니다.\n')
				refreshServer()
			})
			break
		case 'exit':
		case 'stop':
		case 'shutdown':
			logger.log('서버를 종료합니다...')
			process.exit(0)
			break
		case 'op':
			if(commandArgs.length < 1){
				logger.log(`/op <계정ID..> - 해당 ID에 최고 관리자 권한을 부여합니다.`)
				return
			}

			global.Metadata.metadata.get(`overpower`, (isSuccess, data)=>{
				if(data === null || data === undefined) data = []
				for(let opId of commandArgs){
					if(data.indexOf(opId) !== -1){
						logger.log(`ID:${opId} 계정은 이미 최고 관리자 권한을 소유 중입니다.`)
						continue
					}
					
					logger.log(`ID:${opId} 계정에 최고 관리자 권한이 부여되었습니다.`)
					data.push(opId)
				}

				global.Metadata.metadata.set(`overpower`, data, (isSuccess)=>{
					logger.log(`최고 관리자 목록이 DB에 갱신되었습니다.`)
				})
			})
			break
		case 'deop':
			if(commandArgs.length < 1){
				logger.log(`/deop <계정ID..> - 해당 ID에 최고 관리자 권한을 해제합니다.`)
				return
			}

			global.Metadata.metadata.get(`overpower`, (isSuccess, data)=>{
				if(data === null || data === undefined) data = []
				for(let opId of commandArgs){
					let innerIndex = data.indexOf(opId)
					if(innerIndex !== -1){
						logger.log(`ID:${opId} 계정의 최고 관리자 권한이 해제되었습니다.`)
						data.splice(innerIndex, 1)
					}else{
						logger.log(`ID:${opId} 계정은 최고 관리자 권한을 소유하고 있지 않습니다.`)
					}
				}

				global.Metadata.metadata.set(`overpower`, data, (isSuccess)=>{
					logger.log(`최고 관리자 목록이 DB에 갱신되었습니다.`)
				})
			})
			break
		case 'oplist':
			global.Metadata.metadata.get(`overpower`, (isSuccess, data)=>{
				if(data === null || data === undefined) data = []
				logger.log(`최고 관리자 명단:`)
				logger.log(data)
			})
			break
		case 'waitinglist':
			global.Metadata.metadata.get(`waiting`, (isSuccess, data)=>{
				if(data === null || data === undefined) data = []
				logger.log(`현재가입대기자 명단:`)
				logger.log(JSON.stringify(data, null, 2))
			})
			break
		case 'help':
			logger.log('서버에서 사용 가능한 명령어 도움말을 출력합니다.', `[Backend:Loader]`)
			console.log(' ')

			nestedDirectorySearch('/', '/', commandFolderPath, (subPath, staticPath, file)=>{
				let commandFilePath = path.join(staticPath, '/' + file)
				let command = require(commandFilePath)
				if(typeof command['usage'] == 'function')
					command['usage']()
			})
			break
		default:
			if(!fs.existsSync(commandFolderPath)){
				logger.log('명령어 정보가 존재하지 않습니다. (stop, update, refresh, help 가능)')
				//logger.log('해당 명령어가 존재하지 않습니다. ', `[Backend:Command]`)
				logger.log(`(${commandFolderPath} 명령파일도 미존재)`)
				return
			}else{
				// build 내부 폴더들을 링크로 지원하게 설정
				nestedDirectorySearch('/', '/', commandFolderPath, (subPath, staticPath, file)=>{
					let innerSubPath = subPath.replace(new RegExp('/', 'g'), '')
					let commandNamespace = (innerSubPath.length == 0) ? `` : `${innerSubPath}-`
					let commandFileName = `${commandName}.js`
					let changedFileName = commandNamespace + file
					if(commandFileName == changedFileName){
						let commandFilePath = path.join(staticPath, '/' + file)
						let command = require(commandFilePath)

						if(typeof command['default'] == 'function'){
							logger.log(commandName + ' 명령어를 호출합니다..', `[Backend:Loader]`)
							console.log(' ')
							command['default'](commandArgs)
						}else{
							logger.log('(호출함수는 찾지 못했습니다.)', `[Backend:Loader]`)
							logger.log('(export default ~~ 로 지정시 자동 호출됨)', `[Backend:Loader]`)
						}
					}
				})
			}
			break
		}
	})
}

start()

// SERVER 종료 처리 구현
process.on('exit', () => {
	if(server !== null){
		logger.log('EXPRESS 인스턴스를 종료합니다.')
		server.close()
	}
})