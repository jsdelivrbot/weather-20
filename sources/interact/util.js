import {MemoryPreInit} from './util/memory.js'
import {ThemePreInit, ThemeInit, applyColorTheme, getEffects} from './util/theme.js'

import {SpinnerPreInit} from './util/spinner.js'
import {GeoIpPreInit} from './util/geoip.js'
import {NightVisionPreInit} from './util/nightvision.js'

export function UtilPreInit(){

	// 메모리 구성
	MemoryPreInit()
	
	// 테마 구성
	ThemePreInit()

	// 스피너 구성
	SpinnerPreInit()

	// IP 위치추적 구성
	GeoIpPreInit()

	// 야간모드 구성
	NightVisionPreInit()
	
	// 특수효과 접근용 변수
	let effects = getEffects()

	// 테마 적용 함수 추가
	window.armyWeather.util.applyColorTheme = applyColorTheme
}

export function UtilInit(){
	ThemeInit()
}