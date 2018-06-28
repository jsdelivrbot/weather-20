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
var domain = 'http://aftercare-me.run.goorm.io'

// 빌드 파일 폴더 생성
const buildPath = __dirname + '/build'
if (!fs.existsSync(buildPath)) fs.mkdirSync(buildPath)

var app = null
var server = null

function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
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

	// 폴더 내부 검색
	var nestedDirectorySearch = (originPath, subPath, staticPath, callback)=>{
		let files = fs.readdirSync(staticPath)

		if(originPath !== subPath)
			callback(subPath, staticPath)

		for(let file of files){
			fs.stat(staticPath + '/' + file, (error, stats)=>{
				if(error || !stats.isDirectory()) return
				nestedDirectorySearch(originPath, subPath + file + '/', staticPath+ '/' + file, callback)
			})
		}
	}

	// build 내부 폴더들을 링크로 지원하게 설정
	nestedDirectorySearch('/', '/', buildPath, (subPath, staticPath)=>{
		logger.log (`리소스 연동완료 ${staticPath} to ${subPath}`)
		app.use(subPath, express.static(staticPath))
	})

	// APP 접속 경로 생성
	server = app.listen(80, ()=>{
		logger.log('ARMY-WEATHER 서비스 활성화 되었습니다.\n')
		logger.log('현재 연결되어있는 앱 도메인:')
		logger.log(domain + '\n')
	})
	killable(server)
	
	// APP API Receiver 사용
	receiver.init(app)
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
	logger.log('ARMY-WEATHERE 서비스 활성화를 진행합니다...')
	
	startServer()

	const line = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	})

	line.on('line', (input) => {
		let commandName = input.toLowerCase().split(' ')[0]
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
			logger.log('서버를 종료합니다...')
			process.exit(0)
			break
		default:
			logger.log('명령어 정보가 존재하지 않습니다. (stop, update, refresh 가능)')
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