import CommonActual from './actual.js'
import CommonDocument from './document.js'
import CommonExist from './exist.js'
import CommonLatest from './latest.js'
import CommonLogin from './login.js'
import CommonLogout from './logout.js'
import CommonProfile from './profile.js'
import CommonRegister from './register.js'
import CommonUnregister from './unregister.js'
import CommonUpdate from './update.js'

export default function Identification
	(app, database, databaseKey, apiPath, processId, processType){

	app.post(`${apiPath}/actual`,(request,response)=>{
		CommonActual(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/document`,(request,response)=>{
		CommonDocument(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/exist`,(request,response)=>{
		CommonExist(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/latest`,(request,response)=>{
		CommonLatest(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/login`,(request,response)=>{
		CommonLogin(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/logout`,(request,response)=>{
		CommonLogout(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/profile`,(request,response)=>{
		CommonProfile(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/register`,(request,response)=>{
		CommonRegister(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/unregister`,(request,response)=>{
		CommonUnregister(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/update`,(request,response)=>{
		CommonUpdate(request, response, database, databaseKey, processId, processType) })
}