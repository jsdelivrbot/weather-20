import CommonChange from './change.js'
import CommonCount from './count.js'
import CommonDelete from './delete.js'
import CommonExist from './exist.js'
import CommonRead from './read.js'
import CommonWrite from './write.js'

export default function Comment
	(app, database, databaseKey, apiPath, processId, processType){

	app.post(`${apiPath}/change`,(request,response)=>{
		CommonChange(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/count`,(request,response)=>{
		CommonCount(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/delete`,(request,response)=>{
		CommonDelete(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/exist`,(request,response)=>{
		CommonExist(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/read`,(request,response)=>{
		CommonRead(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/write`,(request,response)=>{
		CommonWrite(request, response, database, databaseKey, processId, processType) })
}