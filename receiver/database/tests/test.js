import fs from 'fs'
import Logger from '../logger.js'

// 테스트 폴더 생성
const testPath = __dirname + '/private_data'
if (!fs.existsSync(testPath)) fs.mkdirSync(testPath)

// Metadata 테스트 유닛
import {MetadataCreateTest,
	    MetadataReadWriteTest,
	    MetadataExistAndUnsetTest,
	    MetadataUnloadReloadTest,
	    MetadataCRUDTest} from './metadata.js'

import {StandardCreateTest,
	    StandardAccountTest,
	    StandardNotificationTest,
	    StandardDocumentTest} from './standard.js'

new Promise((resolve)=>{

	MetadataCreateTest(testPath, (isSuccess)=>{
		Logger.log('[Metadata] CreateTest', isSuccess ? 'PASS' : 'FAIL')
	})
	MetadataReadWriteTest(testPath, (isSuccess)=>{
		Logger.log('[Metadata] ReadWriteTest', isSuccess ? 'PASS' : 'FAIL')
	})
	MetadataExistAndUnsetTest(testPath, (isSuccess)=>{
		Logger.log('[Metadata] ExistAndUnsetTest', isSuccess ? 'PASS' : 'FAIL')
	})
	MetadataCRUDTest(testPath, (isSuccess)=>{
		Logger.log('[Metalist] MetalistCRUDTest', isSuccess ? 'PASS' : 'FAIL')
		console.log(' ')
		resolve()
	})
	/*
	MetadataUnloadReloadTest(testPath, (isSuccess)=>{
		Logger.log('[Metadata] UnloadReloadTest', isSuccess ? 'PASS' : 'FAIL')
		resolve()
	})
	*/
}).then(()=>{
	StandardCreateTest(testPath, (isSuccess)=>{
		Logger.log('[Standard] CreateTest', isSuccess ? 'PASS' : 'FAIL')
		console.log(' ')
	})

	StandardAccountTest()
	StandardNotificationTest()
	StandardDocumentTest()
})
