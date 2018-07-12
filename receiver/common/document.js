import CommonDocument from './document/document.js'
import Security from '../security.js'
import Logger from '../logger.js'
import moment from 'moment'

let database = null

export function Document(paramApp, paramDatabase){
	if(database === null) database = paramDatabase

	CommonDocument(paramApp, paramDatabase, `document`, `/api/document`, `Document`, `게시글`)
}