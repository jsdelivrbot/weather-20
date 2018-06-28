let addressSlider = null

export function AddressInit (){

	addressSlider = new Swiper('.local-address-slider', {
		slidesPerView: 5,
		centeredSlides: false,
		grabCursor: true,
		scrollbar: {
			el: '.swiper-scrollbar',
			hide: true,
		}
	})
}