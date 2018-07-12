import CommonJoin from './join.js'
import CommonLeave from './leave.js'
import CommonManagerCheck from './manager-check.js'
import CommonManagerCount from './manager-count.js'
import CommonMemberCheck from './member-check.js'
import CommonMemberCount from './member-count.js'
import CommonResign from './resign.js'
import CommonSign from './sign.js'

export default function Channel
	(app, database, databaseKey, apiPath, processId, processType, manageType){

	app.post(`${apiPath}/join`,(request,response)=>{
		CommonJoin(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/leave`,(request,response)=>{
		CommonLeave(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/manager-check`,(request,response)=>{
		CommonManagerCheck(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/manager-count`,(request,response)=>{
		CommonManagerCount(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/member-check`,(request,response)=>{
		CommonMemberCheck(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/member-count`,(request,response)=>{
		CommonMemberCount(request, response, database, databaseKey, processId, processType) })
	app.post(`${apiPath}/resign`,(request,response)=>{
		CommonResign(request, response, database, databaseKey, processId, manageType) })
	app.post(`${apiPath}/sign`,(request,response)=>{
		CommonSign(request, response, database, databaseKey, processId, manageType) })
}

// TODO
// ChannelAuthorizeRequest
// 채널에 가입요청을 한 후 맞으면 들어가는 형태