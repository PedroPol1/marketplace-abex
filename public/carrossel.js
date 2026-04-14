
let slideIndex = 0; 
const slides = document.querySelectorAll('.slide'); 

function mudarSlide(n) {
    
    slides[slideIndex].classList.remove('ativo');

    slideIndex += n;

    
    if (slideIndex >= slides.length) {
        slideIndex = 0;
    }
    
    if (slideIndex < 0) {
        slideIndex = slides.length - 1;
    }

    
    slides[slideIndex].classList.add('ativo');
}