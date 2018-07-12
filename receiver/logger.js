var currentLevel = 0

class Logger {
	static setLevel(level){
		currentLevel = level
	}
	
	static log(log, header, level) {
		if(level < currentLevel) return false
		
		let now = new Date()
		let timeFormat = String()

		timeFormat += (String(now.getHours()).length > 1 ? now.getHours() : '0' + now.getHours())
		timeFormat += ':' + (String(now.getMinutes()).length > 1 ? now.getMinutes() : '0' + now.getMinutes())
		timeFormat += ':' + (String(now.getSeconds()).length > 1 ? now.getSeconds() : '0' + now.getSeconds())

		let defaultFormat = String.fromCharCode(0x1b) + "[34;1m" + "[%time%] %header% " + String.fromCharCode(0x1b) + "[37;1m" + "%log%"
		console.log(defaultFormat.replace('%time%', timeFormat)
					.replace('%log%', log).replace('%header%', header))

		return true
	}
}

export default Logger