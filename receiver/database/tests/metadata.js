import Metadata from '../metadata.js'

let db = null

export function MetadataCreateTest (testPath, callback){
	db = new Metadata(testPath, 'data', 'db', (isSuccess, instance)=>{
		callback(isSuccess)
	})
}

export function MetadataReadWriteTest (testPath, callback){
	let success = true
	let calledCount = 0

	// 동시 접근 폴트 톨러런싱 검사
	db.set('id', 'account-a', ()=>{calledCount++})
	db.set('pw', 'accounts-secret', ()=>{calledCount++})
	db.set('id.type', 'male', ()=>{calledCount++})

	db.get('id', (isSuccess, data, status)=>{
		if(success) success = data = 'account-a'
		calledCount++
	})
	db.get('pw', (isSuccess, data, status)=>{
		if(success) success = data == 'accounts-secret'
		calledCount++
	})
	db.get('id.type', (isSuccess, data, status)=>{
		if(success) success = data == 'male'
		calledCount++
	})

	db.getAll('id', (isSuccess, data, status)=>{
		if(success) success= typeof data['_value'] != 'undefined'
		if(success) success = typeof data['type'] != 'undefined'
		if(success) success = ++calledCount === 7
	})

	// 체인지 함수 동시성 폴트 톨러런싱 검사
	db.change('latest', 
		(isSuccess, data, status)=>{
			//console.log('*change 반영확인 한 data 값:', data) //null
			return {
				act: 'set',
				data: 0
			}
		},(isSuccess, resolve)=>{
			if(success) success = isSuccess
			resolve()
			//console.log('*change 최종작업 결과:', isSuccess)
		}
	)

	db.get('latest', (isSuccess, data, status)=>{
		//console.log('*get 반영확인 한 data 값:', data) //0
		if(success) success = isSuccess
		if(success) success = (data == 0)
	})
	
	db.change('latest', 
		(isSuccess, data, status)=>{
			//console.log('*change 중간확인 한 data 값:', data) //0
		if(success) success = isSuccess
		if(success) success = (data == 0)
			return {
				act: 'set',
				data: data+1
			}
		},(isSuccess, resolve)=>{
			if(success) success = isSuccess
			resolve()
			//console.log('*change 최종작업 결과:', isSuccess)
		}
	)
	db.get('latest', (isSuccess, data, status)=>{
		//console.log('*get 반영확인 한 data 값:', data) //1
		if(success) success = isSuccess
		if(success) success = (data == 1)
	})


	db.change('latest', 
		(isSuccess, data, status)=>{
			//console.log('*change 중간확인 한 data 값:', data) //1
			if(success) success = isSuccess
			if(success) success = (data == 1)
			return {
				act: 'set',
				data: data+1
			}
		},(isSuccess, resolve)=>{
			if(success) success = isSuccess
			resolve()
			//console.log('*change 최종작업 결과:', isSuccess) 
		}
	)
	db.get('latest', (isSuccess, data, status)=>{
		//console.log('*get 반영확인 한 data 값:', data) //2
		if(success) success = isSuccess
		if(success) success = (data == 2)
		callback(success)
	})
}

export function MetadataExistAndUnsetTest (testPath, callback){

	// 동시 접근 폴트 톨러런싱 검사
	db.set('decoy-1', `i am ephemerous-1!`)
	db.set('decoy-2', `i am ephemerous-2!`)
	db.set('decoy-3', `i am ephemerous-3!`)

	let success = true
	db.exist('decoy-1', (isExist, dataCount)=>{
		if(success) success = isExist
	})
	db.unset('decoy-1', (isSuccess, unsettedCount)=>{
		if(success) success = isSuccess
	})
	db.exist('decoy-2', (isExist, dataCount)=>{
		if(success) success = isExist
	})
	db.unset('decoy-2', (isSuccess, unsettedCount)=>{
		if(success) success = isSuccess
	})
	db.exist('decoy-3', (isExist, dataCount)=>{
		if(success) success = isExist
	})
	db.unset('decoy-3', (isSuccess, unsettedCount)=>{
		if(success) success = isSuccess
		callback(success)
	})
}

export function MetadataUnloadReloadTest (testPath, callback){

	// 복합 로드 언로드 폴트 톨러런싱 검사
	let success = true
	db.unload((isSuccess)=>{
		if(success) success = isSuccess
	})
	db.reload((isSuccess)=>{
		if(success) success = isSuccess
	})
	db.get('id', (isSuccess, data, status)=>{
		if(success) success = (data == 'account-a')
	})
	db.unload((isSuccess)=>{
		if(success) success = isSuccess
	})

	// 연속 리로드 폴트 톨러런싱 검사
	db.reload((isSuccess)=>{
		if(success) success = isSuccess
	})
	db.get('id', (isSuccess, data, status)=>{
		if(success) success = (data == 'account-a')
	})
	db.reload((isSuccess)=>{
		if(success) success = isSuccess
	})
	db.reload((isSuccess)=>{
		if(success) success = isSuccess
	})
	
	// 연속 언로드 폴트 톨러런싱 검사
	db.unload((isSuccess)=>{
		if(success) success = isSuccess
	})
	db.unload((isSuccess)=>{
		if(success) success = isSuccess
	})
	db.unload((isSuccess)=>{
		if(success) success = isSuccess
	})
	
	// 자동 리로드 폴트 톨러런싱 검사
	db.get('id', (isSuccess, data, status)=>{
		if(success) success = (data == 'account-a')
	})
	db.unload((isSuccess)=>{
		if(success) success = isSuccess
	})
	db.get('id', (isSuccess, data, status)=>{
		if(success) success = (data == 'account-a')
	})
	db.reload((isSuccess)=>{
		if(success) success = isSuccess
	})
	db.get('id', (isSuccess, data, status)=>{
		if(success) success = (data == 'account-a')
	})

	// DB 중복선언 폴트 톨러런싱 검사
	let db2 = new Metadata(testPath, 'data', 'db', (isSuccess)=>{
		if(success) success = isSuccess
	})
	db2.get('id', (isSuccess, data, status)=>{
		if(success) success = (data == 'account-a')
	})
	db2.get('id', (isSuccess, data, status)=>{
		if(success) success = (data == 'account-a')
	})
	db2.get('id', (isSuccess, data, status)=>{
		if(success) success = (data == 'account-a')
	})
	db2.unload((isSuccess)=>{
		if(success) success = isSuccess
	})
	db2.unload((isSuccess)=>{
		if(success) success = isSuccess
	})
	db2.reload((isSuccess)=>{
		if(success) success = isSuccess
	})

	// DB 소멸 후 명령시도 폴트 톨러런싱 검사
	db2.close((isSuccess)=>{
		if(success) success = isSuccess
		callback(success)
	})

	// 싱글톤 DB 인스턴스 중복 전달 시 발생하는
	// 핸들 동시 소멸 상황 폴트 톨러런싱 검사
	
	// TODO 완전히 닫힌 후 재생시도
	/*
	let db3 = new Metadata(testPath, 'data', 'db', (isSuccess, instance)=>{
		console.log('#1 닫은 후 생성시도',isSuccess, instance.isClosed, instance)
		//instance.get('id', (isSuccess, data, status)=>{
		//	console.log('#2 닫은 후 획득시도',isSuccess, data)
		//})
	})
	*/
}

export function MetadataCRUDTest (testPath, callback){
	let success = true
	let calledCount = 0

	db.create('document', {'name': 'document_test'}, (isSuccess, id, resolve)=>{
		if(success) success = isSuccess
		if(typeof resolve == 'function') resolve()
	})
	db.create('document', {'name': 'document_test'}, (isSuccess, id, resolve)=>{
		if(success) success = isSuccess
		if(typeof resolve == 'function') resolve()
	})
	db.create('document', {'name': 'document_test'}, (isSuccess, id, resolve)=>{
		if(success) success = isSuccess
		if(typeof resolve == 'function') resolve()
	})
	db.create('document', {'name': 'document_test'}, (isSuccess, id, resolve)=>{
		if(success) success = isSuccess
		if(typeof resolve == 'function') resolve()
	})

	db.read('document', db.encode36(1), (isSuccess, data)=>{
		if(success) success = isSuccess
	})
	db.update('document', db.encode36(1), {'name': 'document_changed'}, (isSuccess)=>{
		if(success) success = isSuccess
	})
	db.read('document', db.encode36(1), (isSuccess, data)=>{
		if(success) success = data.name == 'document_changed'
		if(success) success = isSuccess
	})
	db.check('document', db.encode36(1), (isSuccess, data)=>{
		if(success) success = isSuccess
	})
	db.delete('document', db.encode36(1), (isSuccess)=>{
		if(success) success = isSuccess
	})
	db.delete('document', db.encode36(2), (isSuccess)=>{
		if(success) success = isSuccess
	})
	db.delete('document', db.encode36(3), (isSuccess)=>{
		if(success) success = isSuccess
	})
	db.delete('document', db.encode36(4), (isSuccess)=>{
		if(success) success = isSuccess
	})
	db.check('document', db.encode36(1), (isExist, dataCount)=>{
		if(success) success = !isExist
		db.optimize()
		db.unload()
		callback(success)
	})
}