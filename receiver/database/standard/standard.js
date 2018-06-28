import Metadata from '../metadata.js'

import Identification from './identification.js'
import Notification from './notification.js'

import Document from './document.js'
import Comment from './comment.js'
import Channel from './channel.js'
import Emotion from './emotion.js'

export default class Standard {
	constructor(dbPath, dbName, callback, collectionIds){
		this.dbPath = dbPath
		this.dbName = dbName

		this.isLoaded = false
		this.preCommandQueue = []

		let self = this
		new Metadata(dbPath, dbName, 'db', (isSuccess, metadata)=>{

			// 메타데이터 체계
			self.metadata = metadata

			// 기본 컬렉션 네임스페이스 모음
			if(collectionIds === undefined
			  || collectionIds === null)
				collectionIds = {
					account: "account",
					document: "document",
					channel: "channel",
					subparty: "subparty",
					notification: "notification",
					emotion: "emotion"
				}

			// 계정 체계
			self.account = new Identification(self,
								collectionIds['account'],
								collectionIds['document'])

			// 채널 체계
			self.channel = new Channel(self,
								collectionIds['channel'],
								collectionIds['subparty'],
								collectionIds['document'])

			// 알림 체계
			self.notification = new Notification(self,
								collectionIds['notification'])

			// 게시글 체계
			self.document = new Document(self,
								collectionIds['document'],
								collectionIds['account'],
								collectionIds['channel'])

			// 댓글 체계
			self.comment = new Comment(self,
								collectionIds['document'],
								collectionIds['account'],
								collectionIds['channel'])

			// 감정표현 체계
			self.emotion = new Emotion(self,
								collectionIds['emotion'])

			self.isLoaded = true
			callback(isSuccess, self)
			
			for(let preCommand of self.preCommandQueue)
				preCommand(isSuccess, self)

			self.preCommandQueue = []
		})
	}
	
	process(callback){
		if(!this.isLoaded){
			this.preCommandQueue.push(callback)
			return
		}
		callback(this)
	}
}