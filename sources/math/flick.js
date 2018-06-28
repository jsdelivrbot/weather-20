
class Flick {
	constructor(canvasElementId, colorTypes) {
		this.canvasElementId = canvasElementId
		this.canvasEl = document.getElementById(this.canvasElementId)

		this.tap = ('ontouchstart' in window || navigator.msMaxTouchPoints)
			? 'touchstart' : 'mousedown'

		// 비활성화 시 동작중지용
		this.isActivate = false
		
		// 인스턴스용
		let self = this
		
		this.ctx = this.canvasEl.getContext('2d')
		this.numberOfParticules = 10
		this.colors = colorTypes

		this.render = anime({
			duration: Infinity,
			update: () => {
				self.ctx.clearRect(0, 0, self.canvasEl.width, self.canvasEl.height)
			}
		})

		document.addEventListener(this.tap, (event) => {
			if(!self.isActivate) return
			
			if(event === undefined ||
			   (typeof(event['clientX']) == 'undefined'
			   && typeof(event['touches']) == 'undefined')) return

			self.render.play()
			let pointerX = event.clientX || event.touches[0].clientX
			let pointerY = event.clientY || event.touches[0].clientY
			this.animateParticules(pointerX, pointerY)
		}, false)

		this.setCanvasSize()
		window.addEventListener('resize', this.setCanvasSize, false)
	}
	
	setCanvasSize() {
		if(this.canvasEl === undefined) return

		this.canvasEl.width = window.innerWidth * 2
		this.canvasEl.height = window.innerHeight * 2
		this.canvasEl.style.width = window.innerWidth + 'px'
		this.canvasEl.style.height = window.innerHeight + 'px'
		this.canvasEl.getContext('2d').scale(2, 2)
	}

	setParticuleDirection(p) {
		let angle = anime.random(0, 360) * Math.PI / 180
		let value = anime.random(50, 180)
		let radius = [-1, 1][anime.random(0, 1)] * value
		return {
			x: p.x + radius * Math.cos(angle),
			y: p.y + radius * Math.sin(angle)
		}
	}

	createCircle(x,y) {
		let p = {}
		p.x = x
		p.y = y
		p.color = '#FFF'
		p.radius = 0.1
		p.alpha = .5
		p.lineWidth = 6

		// 인스턴스용
		let self = this

		p.draw = () => {
			self.ctx.globalAlpha = p.alpha
			self.ctx.beginPath()
			self.ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true)
			self.ctx.lineWidth = p.lineWidth
			self.ctx.strokeStyle = p.color
			self.ctx.stroke()
			self.ctx.globalAlpha = 1
		}
		return p
	}

	renderParticule(anim) {
		for (let i = 0; i < anim.animatables.length; i++) {
			anim.animatables[i].target.draw()
		}
	}
	
	animateParticules(x, y ,isSlow = false) {
		var circle = this.createCircle(x, y)
		var particules = []
		for (let i = 0; i < this.numberOfParticules; i++) {
			particules.push(this.createParticule(x, y))
		}
		
		// 인스턴스용
		let self = this
		
		anime.timeline().add({
			targets: particules,
			x: (p) => { return p.endPos.x },
			y: (p) => { return p.endPos.y },
			radius: 0.1,
			duration: (!isSlow) ? anime.random(1200, 1800):  anime.random(3000, 3500),
			easing: 'easeOutExpo',
			update: self.renderParticule
		})
			.add({
				targets: circle,
				radius: anime.random(80, 160),
				lineWidth: 0,
				alpha: {
		  value: 0,
		  easing: 'linear',
		  duration: anime.random(600, 800),  
				},
				duration: anime.random(1200, 1800),
				easing: 'easeOutExpo',
				update: self.renderParticule,
				offset: 0
			})
	}
	
	createParticule(x,y) {
		var p = {}
		p.x = x
		p.y = y
		p.color = this.colors[anime.random(0, this.colors.length - 1)]
		p.radius = anime.random(16, 32)
		p.endPos = this.setParticuleDirection(p)
		
		// 인스턴스용
		let self = this
		
		p.draw = () => {
			self.ctx.beginPath()
			self.ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true)
			self.ctx.fillStyle = p.color
			self.ctx.fill()
		}
		return p
	}
	
	start(){
		this.isActivate = true
		//this.autoClick()
	}
	
	pause(){
		this.isActivate = false
	}

	autoClick() {
		if(!this.isActivate) return
		this.animateParticules(
			anime.random(0,  window.innerWidth), 
			anime.random(0, window.innerHeight)
			, true)
		anime({duration: 1000}).finished.then(()=>{this.autoClick()})
	}

	effect(event){
		if(event === undefined ||
		   (typeof(event['clientX']) == 'undefined'
		   && typeof(event['touches']) == 'undefined')) return
		
		this.render.play()
		let pointerX = event.clientX || event.touches[0].clientX
		let pointerY = event.clientY || event.touches[0].clientY
		this.animateParticules(pointerX, pointerY)
	}
	
	updateColor(colorTypes){
		this.colors = colorTypes
	}
}

export default Flick