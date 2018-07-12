import Identification from './identification/identification.js'
import CommonChannel from './channel/channel.js'
import Security from '../security.js'
import Logger from '../logger.js'
import moment from 'moment'

let database = null

export function Channel(paramApp, paramDatabase){
	if(database === null) database = paramDatabase

	Identification(paramApp, paramDatabase, `channel`, `/api/channel`, `Channel`, `채널`)
	CommonChannel(paramApp, paramDatabase, `channel`, `/api/channel`, `Channel`, `채널`, `채널관리계정`)
}