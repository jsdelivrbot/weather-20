import Standard from '../standard/standard.js'
import Logger from '../logger.js'

let standard = null

export function StandardCreateTest(testPath, callback){
	standard = new Standard(testPath, 'standard', (isSuccess, instance)=>{
		callback(isSuccess, instance)
	})
}

function isPassed(bool){
	return bool ? 'PASS' : 'FAIL'
}

export function StandardAccountTest(){
	standard.process(()=>{

		// 회원가입 시험
		standard.account.register({
			id: 'hmmhmmhm',
			pw: 'blablabla'
		}, (isSuccess, message)=>{
			Logger.log('[Account] Register', `${isPassed(isSuccess)} ${message}`)
		})

		// 회원가입 여부확인 시험
		standard.account.isRegistered('hmmhmmhm', (isExist, message)=>{
			Logger.log('[Account] isRegistered', `${isPassed(isExist)} ${message}`)
		})

		// 회원정보 읽기 시험
		standard.account.read('hmmhmmhm', (isExist, data)=>{
			Logger.log('[Account] Read', `${isPassed(isExist)} ${JSON.stringify(data)}`)
		})

		// 회원정보 수정 시험
		standard.account.update({
			id: 'hmmhmmhm',
			name: 'hm',
			pw: 'blablabla'
		}, (isSuccess, message)=>{
			Logger.log('[Account] Update', `${isPassed(isSuccess)} ${message}`)
		})

		// 회원탈퇴 시험
		standard.account.unregister({
			id: 'hmmhmmhm',
			pw: 'blablabla'
		}, (isSuccess, message)=>{
			Logger.log('[Account] Unegister', `${isPassed(isSuccess)} ${message}`)
			console.log(' ')
		})
	})
}

export function StandardNotificationTest(){
	standard.process(()=>{

		// 알림추가 시험
		standard.notification.push('hmmhmmhm', {context:'Notification Push Test!1'}, (isSuccess, id)=>{
			Logger.log('[Notification] Push 1', `${isPassed(isSuccess)} ${id}`)
		})
		standard.notification.push('hmmhmmhm', {context:'Notification Push Test!2'}, (isSuccess, id)=>{
			Logger.log('[Notification] Push 2', `${isPassed(isSuccess)} ${id}`)
		})

		// 알림갯수 확인 시험
		standard.notification.count('hmmhmmhm', (isSuccess, count)=>{
			Logger.log('[Notification] Count', `${isPassed(isSuccess)} ${count}`)
		})

		// 10진수->36진수 변환함수
		let encode36 = standard.metadata.encode36

		// 알림 읽기 시험
		standard.notification.get('hmmhmmhm', encode36(1), (isSuccess, data)=>{
			Logger.log('[Notification] Get 1', `${isPassed(isSuccess)} ${JSON.stringify(data)}`)
		})

		// 알림 전체 읽기 시험
		standard.notification.getAll('hmmhmmhm', (isSuccess, data)=>{
			Logger.log('[Notification] Get 2', `${isPassed(isSuccess)} ${JSON.stringify(data)}`)
		})

		// 알림 초기화 시험
		standard.notification.clear('hmmhmmhm', (isSuccess, unsettedCount)=>{
			Logger.log('[Notification] Clear', `${isPassed(isSuccess)} ${unsettedCount}`)
			console.log(' ')
		})
	})
}

export function StandardDocumentTest(){
	standard.process(()=>{

		// 10진수->36진수 변환함수
		let encode36 = standard.metadata.encode36

		// 게시글 작성 시험
		standard.document.write({
			account: 'hmmhmmhm',
			context: 'document blabla',
			timestamp: 2018
		}, (isSuccess, documentId)=>{
			Logger.log('[Document] Write', `${isPassed(isSuccess)} ${documentId}`)
		}, 'hmmhmmhm', 'maingroup')

		// 게시글 읽기 시험
		standard.document.read(encode36(1), (isSuccess, documentSchema)=>{
			Logger.log('[Document] Read', `${isPassed(isSuccess)} ${JSON.stringify(documentSchema)}`)
		})

		// 게시글 변경 시험
		standard.document.change(encode36(1), (data)=>{
			data.context += ' (changed)'
			return data

		}, (isSuccess, documentSchema)=>{
			Logger.log('[Document] Change', `${isPassed(isSuccess)}`)
		}, 'hmmhmmhm', 'maingroup')

		// 게시글 읽기 시험
		standard.document.read(encode36(1), (isSuccess, documentSchema)=>{
			Logger.log('[Document] Read', `${isPassed(isSuccess)} ${JSON.stringify(documentSchema)}`)
		})

		standard.document.change(encode36(1), (data)=>{
			data.context += ' (changed)'
			return data

		}, (isSuccess, documentSchema)=>{
			Logger.log('[Document] Fake Change1', `${isPassed(!isSuccess)}`)
		}, 'hmmhmmhm11', 'maingroup')

		standard.document.change(encode36(1), (data)=>{
			data.context += ' (changed)'
			return data

		}, (isSuccess, documentSchema)=>{
			Logger.log('[Document] Fake Change2', `${isPassed(!isSuccess)}`)
		}, 'hmmhmmhm11', 'maingroup222')

		// 유저 연관관계로 게시글 읽기 시험
		// (해당 이용자가 1번째로 쓴 글 읽어오기)
		standard.account.getDocument('hmmhmmhm', encode36(1), (isSuccess, documentSchema)=>{
			Logger.log('[Document] (account.*)Read', `${isPassed(isSuccess)} ${JSON.stringify(documentSchema)}`)
		})
		standard.account.getLatestDocumentNumber('hmmhmmhm', (isSuccess, documentSchema)=>{
			Logger.log('[Document] (account.*)getLatestDocumentNumber', `${isPassed(isSuccess)} ${JSON.stringify(documentSchema)}`)
		})
		standard.account.getActualDocumentCount('hmmhmmhm', (isSuccess, documentSchema)=>{
			Logger.log('[Document] (account.*)getActualDocumentCount', `${isPassed(isSuccess)} ${JSON.stringify(documentSchema)}`)
		})

		// 채널 연관관계로 게시글 읽기 시험
		// (해당 채널에서 1번째로 쓰여진 글 읽어오기)
		standard.channel.getDocument('maingroup', encode36(1), (isSuccess, documentSchema)=>{
			Logger.log('[Document] (channel.*)Read', `${isPassed(isSuccess)} ${JSON.stringify(documentSchema)}`)
		})
		standard.channel.getLatestDocumentNumber('maingroup', (isSuccess, documentSchema)=>{
			Logger.log('[Document] (channel.*)getLatestDocumentNumber', `${isPassed(isSuccess)} ${JSON.stringify(documentSchema)}`)
		})
		standard.channel.getActualDocumentCount('maingroup', (isSuccess, documentSchema)=>{
			Logger.log('[Document] (channel.*)getActualDocumentCount', `${isPassed(isSuccess)} ${JSON.stringify(documentSchema)}`)
			console.log(' ')
		})

		// 코멘트 작성 시험
		standard.comment.write(encode36(1), {
			account: 'hmmhmmhm',
			context: 'comment blabla',
			timestamp: 2018
		}, (isSuccess, commentId, commentNum)=>{
			Logger.log('[Comment] Write1', `${isPassed(isSuccess)} ${commentId} ${commentNum}`)
		}, 'hmmhmmhm', 'maingroup')
		
		// 코멘트 작성 시험
		standard.comment.write(encode36(1), {
			account: 'hmmhmmhm',
			context: 'comment blabla',
			timestamp: 2018
		}, (isSuccess, commentId, commentNum)=>{
			Logger.log('[Comment] Write2', `${isPassed(isSuccess)} ${commentId} ${commentNum}`)
		}, 'hmmhmmhm', 'maingroup')

		// 코멘트 갯수 확인 시험
		standard.comment.count(encode36(1), (isSuccess, commentId)=>{
			Logger.log('[Comment] Count', `${isPassed(isSuccess)} ${commentId}`)
		})

		// 코멘트 존재 확인 시험
		standard.comment.exist(encode36(1), encode36(1), (isSuccess)=>{
			Logger.log('[Comment] Exist', `${isPassed(isSuccess)}`)
		})

		// 코멘트 읽기 시험
		standard.comment.read(encode36(1), encode36(1), (isSuccess, data)=>{
			Logger.log('[Comment] Read', `${isPassed(isSuccess)} ${JSON.stringify(data)}`)
		})

		// 코멘트 변경 시험
		standard.comment.change(encode36(1), encode36(1), (data)=>{

			// 실제 사용 시에는
			// 순번이 초기화되었을 경우를 가정해서
			// _id가 맞을 때만 변경하는 것 필요
			data.context = 'comment change'
			return data

		}, (isSuccess)=>{
			Logger.log('[Comment] Change', `${isPassed(isSuccess)}`)
		})

		// 코멘트 읽기 시험
		standard.comment.read(encode36(1), encode36(1), (isSuccess, data)=>{
			Logger.log('[Comment] Read', `${isPassed(isSuccess)} ${JSON.stringify(data)}`)
		})

		// TODO account.hmmhmmhm 이 쓴 게시글 확인하는 코드
		// TODO channel.maingroup 에서 쓴 게시글 확인하는 코드
		// identification 작업 필요


		// 코멘트 직접 삭제 시험
		// (1->2->3 이 아닌 3->2->1 도 작동됨)
		standard.document.delete(encode36(1), (isSuccess)=>{
			Logger.log('[Comment] Delete1', `${isPassed(isSuccess)}`)
		})
		standard.document.delete(encode36(2), (isSuccess)=>{
			Logger.log('[Comment] Delete2', `${isPassed(isSuccess)}`)
		})
		standard.document.delete(encode36(3), (isSuccess)=>{
			Logger.log('[Comment] Delete3', `${isPassed(isSuccess)}`)
		})
		// 코멘트 읽기 시험
		standard.comment.read(encode36(1), encode36(1), (isSuccess, data)=>{
			Logger.log('[Comment] Empty Read', `${isPassed(!isSuccess)} ${JSON.stringify(data)}`)
			console.log(' ')
		})

		// 채널생성 시험
		standard.channel.register({
			id: 'maingroup',
			pw: 'blablabla'
		}, (isSuccess, message)=>{
			Logger.log('[Channel] Register', `${isPassed(isSuccess)} ${message}`)
		})

		// 채널생성 여부확인 시험
		standard.channel.isRegistered('maingroup', (isExist, message)=>{
			Logger.log('[Channel] isRegistered', `${isPassed(isExist)} ${message}`)
		})

		// 채널정보 읽기 시험
		standard.channel.read('maingroup', (isExist, data)=>{
			Logger.log('[Channel] Read', `${isPassed(isExist)} ${JSON.stringify(data)}`)
		})

		// 채널정보 수정 시험
		standard.channel.update({
			id: 'maingroup',
			name: 'Main Group',
			pw: 'blablabla'
		}, (isSuccess, message)=>{
			Logger.log('[Channel] Update', `${isPassed(isSuccess)} ${message}`)
		})

		// 유저 가입 수 확인 시험
		standard.channel.memberCount('maingroup', (isSuccess, countNum)=>{
			Logger.log('[Channel] Member Count', `${isPassed(isSuccess)} ${countNum}`)
		})

		// 유저의 채널가입 시험
		standard.channel.join('maingroup', 'hmmhmmhm', (isSuccess, status)=>{
			Logger.log('[Channel] Member Join REAL', `${isPassed(isSuccess)} ${status}`)
		})

		// 유저의 채널가입 시험
		standard.channel.join('maingroup2222', 'hmmhmmhm', (isSuccess, status)=>{
			Logger.log('[Channel] Member Join FAKE', `${isPassed(!isSuccess)} ${status}`)
		})

		// 유저 가입 수 확인 시험
		standard.channel.memberCount('maingroup', (isSuccess, countNum)=>{
			Logger.log('[Channel] Member Count', `${isPassed(isSuccess)} ${countNum}`)
		})

		// 유저의 채널가입 여부확인 시험
		standard.channel.isMember('maingroup', 'hmmhmmhm', (isSuccess)=>{
			Logger.log('[Channel] Member IsMember', `${isPassed(isSuccess)}`)
		})

		// 유저의 채널가입 시험
		standard.channel.leave('maingroup', 'hmmhmmhm', (isSuccess, status)=>{
			Logger.log('[Channel] Member Leave', `${isPassed(isSuccess)} ${status}`)
		})

		// 유저의 채널가입 여부확인 시험
		standard.channel.isMember('maingroup', 'hmmhmmhm', (isSuccess)=>{
			Logger.log('[Channel] Member IsMember', `${isPassed(!isSuccess)}`)
		})

		// 유저 가입 수 확인 시험
		standard.channel.memberCount('maingroup', (isSuccess, countNum)=>{
			Logger.log('[Channel] Member Count', `${isPassed(isSuccess)} ${countNum}`)
			console.log(' ')
		})

		// 특정채널 서브파티 획득시험
		let subParty = standard.channel.subParty('maingroup')

		// 서브파티 생성 시험
		subParty.register({
			id: 'subparty1',
			pw: 'blablabla'
		}, (isSuccess, message)=>{
			Logger.log('[Subparty] Register', `${isPassed(isSuccess)} ${message}`)
		})

		// 서브파티 생성확인 시험
		subParty.isRegistered('subparty1', (isExist, message)=>{
			Logger.log('[Subparty] isRegistered REAL', `${isPassed(isExist)} ${message}`)
		})
		// 서브파티 생성확인 시험
		subParty.isRegistered('nonexist1', (isExist, message)=>{
			Logger.log('[Subparty] isRegistered FAKE', `${isPassed(!isExist)} ${message}`)
		})

		subParty.unregister({
			id: 'subparty1'
		}, (isSuccess, message)=>{
			Logger.log('[Subparty] Unegister', `${isPassed(isSuccess)} ${message}`)
			console.log(' ')
		})
		
		let subParty2 = standard.channel.subParty('non-exist-group')
		subParty2.isRegistered('subparty1', (isExist, message)=>{
			Logger.log('[Subparty] isRegistered FAKE', `${isPassed(isExist)} ${message}`)
		})

		// 채널삭제 시험
		standard.channel.unregister({
			id: 'maingroup',
			pw: 'blablabla'
		}, (isSuccess, message)=>{
			Logger.log('[Channel] Unegister', `${isPassed(isSuccess)} ${message}`)
			console.log(' ')
		})

		// 좋아요 갯수확인 시험
		standard.emotion.expressCount('like', encode36(1), (isSuccess, countNum)=>{
			Logger.log('[Emotion] Like Count', `${isPassed(isSuccess)} ${countNum}`)
		})

		// 좋아요 시험
		standard.emotion.express('like', encode36(1), 'hmmhmmhm', (isSuccess, status)=>{
			Logger.log('[Emotion] Like Express', `${isPassed(isSuccess)} ${status}`)
		})

		standard.emotion.isExpressed('like', encode36(1), 'hmmhmmhm', (isSuccess, status)=>{
			Logger.log('[Emotion] Like isExpressed', `${isPassed(isSuccess)}`)
		})

		// 좋아요 갯수확인 시험
		standard.emotion.expressCount('like', encode36(1), (isSuccess, countNum)=>{
			Logger.log('[Emotion] Like Count', `${isPassed(isSuccess)} ${countNum}`)
		})

		// 좋아요 해제 시험
		standard.emotion.depress('like', encode36(1), 'hmmhmmhm', (isSuccess, status)=>{
			Logger.log('[Emotion] Like Depress REAL', `${isPassed(isSuccess)} ${status}`)
		})
		standard.emotion.depress('like', encode36(1), 'hmmhmmhm', (isSuccess, status)=>{
			Logger.log('[Emotion] Like Depress FAKE', `${isPassed(!isSuccess)} ${status}`)
		})

		// 좋아요 갯수확인 시험
		standard.emotion.expressCount('like', encode36(1), (isSuccess, countNum)=>{
			Logger.log('[Emotion] Like Count', `${isPassed(isSuccess)} ${countNum}`)
		})

		standard.metadata.optimize()
		standard.metadata.unload()
		return
	})
}