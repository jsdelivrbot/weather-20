// 메뉴쪽 태그요소
var menuBarWeather = document.getElementById('menu-bar-weather')
var menuBarLife = document.getElementById('menu-bar-life')
var menuBarHealth = document.getElementById('menu-bar-health')

// 컨테이너쪽 태그요소
var weatherContainer = document.getElementById('weather')
var lifeContainer = document.getElementById('life')
var healthContainer = document.getElementById('health')

// 페이지 내부 상호작용 불러오기

// 테마 함수
import {refreshEffect, reloadEffect, getEffects, applyColorTheme} from './util/theme.js'

// 현재 페이지 정보
var currentPage = ''
var hooks = {
	weather: [],
	health: [],
	life: []
}

export function getPage () {
	return currentPage
}

export function resetMenu () {
	if(menuBarWeather.classList.contains('menu-item-selected'))
		menuBarWeather.classList.remove('menu-item-selected')
	if(menuBarLife.classList.contains('menu-item-selected'))
		menuBarLife.classList.remove('menu-item-selected')
	if(menuBarHealth.classList.contains('menu-item-selected'))
		menuBarHealth.classList.remove('menu-item-selected')

	if(menuBarWeather.classList.contains('menu-item'))
		menuBarWeather.classList.remove('menu-item')
	if(menuBarLife.classList.contains('menu-item'))
		menuBarLife.classList.remove('menu-item')
	if(menuBarHealth.classList.contains('menu-item'))
		menuBarHealth.classList.remove('menu-item')
}

export function weatherPageRoute (event) {
	if(currentPage == 'weather') return
	let effects = getEffects()

	resetMenu()
	menuBarWeather.classList.add('menu-item-selected')
	menuBarLife.classList.add('menu-item')
	menuBarHealth.classList.add('menu-item')

	weatherContainer.style.display = 'block'
	lifeContainer.style.display = 'none'
	healthContainer.style.display = 'none'
	currentPage = 'weather'

	refreshEffect()
	reloadEffect()
	effects.weatherFlick.start()

	// 터치 이펙트 동기화
	effects.weatherFlick.effect(event)

	applyColorTheme('cloud')

	for(let hook of hooks['weather'])
		if(typeof hook == 'function') hook()
}

export function healthPageRoute (event) {
	if(currentPage == 'health') return
	let effects = getEffects()

	resetMenu()
	menuBarWeather.classList.add('menu-item')
	menuBarLife.classList.add('menu-item')
	menuBarHealth.classList.add('menu-item-selected')

	weatherContainer.style.display = 'none'
	lifeContainer.style.display = 'none'
	healthContainer.style.display = 'block'
	currentPage = 'health'

	refreshEffect()
	reloadEffect()
	effects.healthFlick.start()

	// 터치 이펙트 동기화
	effects.healthFlick.effect(event)

	applyColorTheme('cloud')

	for(let hook of hooks['health'])
		if(typeof hook == 'function') hook()
}

export function lifePageRoute (event) {
	if(currentPage == 'life') return
	let effects = getEffects()

	resetMenu()
	menuBarWeather.classList.add('menu-item')
	menuBarLife.classList.add('menu-item-selected')
	menuBarHealth.classList.add('menu-item')

	weatherContainer.style.display = 'none'
	lifeContainer.style.display = 'block'
	healthContainer.style.display = 'none'
	currentPage = 'life'

	refreshEffect()
	reloadEffect()
	effects.lifeFlick.start()

	// 터치 이펙트 동기화
	effects.lifeFlick.effect(event)

	applyColorTheme('cloud')

	for(let hook of hooks['life'])
		if(typeof hook == 'function') hook()
}

export function MenuInit (){
	/*
	 * 페이지 전환 구현코드
	 */
	menuBarWeather.addEventListener('click', weatherPageRoute)
	menuBarLife.addEventListener('click', lifePageRoute)
	menuBarHealth.addEventListener('click', healthPageRoute)

	// 날씨정보 메뉴를 메인으로 승격
	weatherPageRoute()

	let effects = getEffects()
}

export function MenuHook (pageName, callback){
	if(typeof hooks[pageName] == 'undefined')
		hooks[pageName] = []
	hooks[pageName].push(callback)
}