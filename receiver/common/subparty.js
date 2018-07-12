import Identification from './identification/identification.js'
import CommonSubParty from './subparty/subparty.js'
import Security from '../security.js'
import Logger from '../logger.js'
import moment from 'moment'

let database = null

export function SubParty(paramApp, paramDatabase){
	if(database === null) database = paramDatabase

	Identification(paramApp, paramDatabase, `subparty`, `/api/subparty`, `SubParty`, `모임`)
	CommonSubParty(paramApp, paramDatabase, `subparty`, `/api/subparty`, `SubParty`, `모임`, `모임관리계정`)
}