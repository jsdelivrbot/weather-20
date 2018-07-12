import CommonDelete from './delete.js'
import CommonExist from './exist.js'
import CommonRead from './read.js'
import CommonUpdate from './update.js'
import CommonWrite from './write.js'

export default function Document
	(app, database, databaseKey, apiPath, processId, processType){

	app.post(`${apiPath}/delete`,(request,response)=>{
		CommonDelete(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/exist`,(request,response)=>{
		CommonExist(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/read`,(request,response)=>{
		CommonRead(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/update`,(request,response)=>{
		CommonUpdate(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/write`,(request,response)=>{
		CommonWrite(request, response, database, databaseKey, processId, processType) })
}