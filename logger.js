
// TODO 파일로깅
// var file

// 0에서부터 시작하고
// 숫자가 높을 수록 그 이전
// 레벨의 로그는 무시
var currentLevel = 23

class Logger {
	static setLevel(level){
		currentLevel = level
	}
	
	static log(log, level) {
		if(level < currentLevel) return false
		
		let now = new Date()
		let timeFormat = String()
		
		timeFormat += (String(now.getHours()).length > 1 ? now.getHours() : '0' + now.getHours());
		timeFormat += ':' + (String(now.getMinutes()).length > 1 ? now.getMinutes() : '0' + now.getMinutes())
		timeFormat += ':' + (String(now.getSeconds()).length > 1 ? now.getSeconds() : '0' + now.getSeconds()) + ""
		
		let defaultFormat = String.fromCharCode(0x1b) + "[34;1m" + "[%time%] " + String.fromCharCode(0x1b) + "[37;1m" + "%log%"
		console.log(defaultFormat.replace('%time%', timeFormat).replace('%log%', log))
		
		return true
	}
}

export default Logger