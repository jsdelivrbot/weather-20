var spinnerDiv = document.getElementById('spinner')
var spinnerText = document.getElementById('spinner-popup-text')

export function Spinner(text){
	spinnerDiv.style.display = 'block'
	if(text != null) spinnerText.innerText = text
	else spinnerText.innerText = '잠시 기다려주세요...'
}

export function SpinnerHide(){
	spinnerDiv.style.display = 'none'
}

export function SpinnerPreInit (){
	window.armyWeather.util.spinner = Spinner
	window.armyWeather.util.spinnerHide = SpinnerHide
}