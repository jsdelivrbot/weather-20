let isNightVisioned = false

// 동적 CSS 애니메이팅 효과 구현용 함수
var insertStyleSheetRule = (ruleText, paramSheetIndex) => {
	let sheets = document.styleSheets
	if(sheets.length == 0) {
		let style = document.createElement('style')
		style.appendChild(document.createTextNode(''))
		document.head.appendChild(style)
	}

	let sheet = sheets[sheets.length - 1]
	let sheetIndex = (paramSheetIndex != undefined) ? paramSheetIndex :
		(sheet.rules ? sheet.rules.length : sheet.cssRules.length)
	sheet.insertRule(ruleText, sheetIndex)
	return sheetIndex
}

let getCSSRule = (ruleName, isNeedToDelete) => {
	ruleName = ruleName.toLowerCase()
	if(document.styleSheets) {
		// style sheet loop
		for(let styleSheetIndex = 0; styleSheetIndex < document.styleSheets.length; styleSheetIndex++) {
			let styleSheet = document.styleSheets[styleSheetIndex]
			
			if(typeof styleSheet['cssRules'] == 'undefined') continue
			if(typeof styleSheet['cssRules'] == 'null') continue
			if(styleSheet.cssRules == null) continue

			for(let cssRuleIndex = 0; cssRuleIndex < styleSheet.cssRules.length ; cssRuleIndex ++){
				let cssRule = styleSheet.cssRules[cssRuleIndex]
				if(typeof cssRule['selectorText'] == 'undefined') continue
				if (cssRule.selectorText.toLowerCase()==ruleName) {
					if (!isNeedToDelete) return cssRule
					//console.log('removed', cssRuleIndex)
					if (styleSheet.cssRules)
						styleSheet.deleteRule(cssRuleIndex)
					else
						styleSheet.removeRule(cssRuleIndex)
					return true
				}
			}
		}
	}
	return false
}
let killCSSRule = (ruleName) => { return getCSSRule(ruleName, true) }

export function NightVisionPreInit (){
	window.armyWeather.util.nightvision = (isActivate=false)=>{
		//html, body, .night-vision
		if(isActivate){
			insertStyleSheetRule(

				`html, body, .night-vision {
	-webkit-filter: brightness(1.1) hue-rotate(300deg) invert(1);
	filter: brightness(1.1) hue-rotate(300deg) invert(1);
	background: #000000;
}`
			)
		}else{
			killCSSRule('html, body, .night-vision')
		}
	}
	//window.armyWeather.util.nightvision(true)
}