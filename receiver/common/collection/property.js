import CommonAdd from './add.js'
import CommonCheck from './check.js'
import CommonCount from './count.js'
import CommonDelete from './delete.js'

export default function Channel
	(app, database, databaseKey, apiPath, processId, processType, manageType, allowedPropertyTypes=[]){

	app.post(`${apiPath}/property-add`,(request,response)=>{
		CommonAdd(request, response, database, databaseKey, processId, processType, allowedPropertyTypes) })
	app.post(`${apiPath}/property-check`,(request,response)=>{
		CommonCheck(request, response, database, databaseKey, processId, processType, allowedPropertyTypes) })
	app.post(`${apiPath}/property-count`,(request,response)=>{
		CommonCount(request, response, database, databaseKey, processId, processType, allowedPropertyTypes) })
	app.post(`${apiPath}/property-delete`,(request,response)=>{
		CommonDelete(request, response, database, databaseKey, processId, processType, allowedPropertyTypes) })
}