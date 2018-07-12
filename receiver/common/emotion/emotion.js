import CommonDepress from './depress.js'
import CommonExpressCheck from './express-check.js'
import CommonExpressCount from './express-count.js'
import CommonExpress from './express.js'

export default function Channel
	(app, database, databaseKey, apiPath, processId, processType, manageType){

	app.post(`${apiPath}/depress`,(request,response)=>{
		CommonDepress(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/express-check`,(request,response)=>{
		CommonExpressCheck(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/express-count`,(request,response)=>{
		CommonExpressCount(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/express`,(request,response)=>{
		CommonExpress(request, response, database, databaseKey, processId, processType) })
}