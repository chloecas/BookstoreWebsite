/*---------------------------------- Global ressources ----------------------------------*/
let currentIndex = 0;
let index = 0;
const hero = document.querySelector(".hero");
const viewport = document.querySelector(".carousel-viewport");
const track = document.getElementById("track");

const images = [
  "../img/home-imageSlider/khanh-do-Ubs4WISHgr4-unsplash.jpg",
  "../img/home-imageSlider/aaron-burden-y02jEX_B0O0-unsplash.jpg",
  "../img/home-imageSlider/thomas-kelley-hHL08lF7Ikc-unsplash.jpg",
  "../img/home-imageSlider/melody-zimmerman-INr3HbMSMSw-unsplash.jpg",
  "../img/home-imageSlider/benjamin-raffetseder-LyOz2jJdCY8-unsplash.jpg",
  "../img/home-imageSlider/k-h-jG-rhs1S4xE-unsplash.jpg",
  "../img/home-imageSlider/debby-hudson-DR31squbFoA-unsplash.jpg"
];

hero.style.backgroundImage = `
  linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)),
  url('${images[index]}')
`;
/*---------------------------------- Running when page loads ----------------------------------*/

setInterval(changeBackground, 10000); // change every 10 seconds
updateCarousel();

/*---------------------------------- Functions ----------------------------------*/

function changeBackground() {
  index = (index + 1) % images.length;

  hero.style.backgroundImage = `
    linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)),
    url('${images[index]}')
  `;
}

function updateCarousel() {
  const slides = document.querySelectorAll(".slide");

  slides.forEach(slide => slide.classList.remove("active"));
  slides[currentIndex].classList.add("active"); //The current elemetn is the active one

  const slideWidth = slides[currentIndex].offsetWidth;
  const gap = 20;  //space between slides
  const viewportWidth = viewport.offsetWidth;

  const centered = (viewportWidth / 2) - (slideWidth / 2);
  const moveAmount = currentIndex * (slideWidth + gap);

  track.style.transform = "translateX(" + (centered - moveAmount) + "px)"; //Move to the sides
}

function move(direction) {
  const slides = document.querySelectorAll(".slide");
  const totalSlides = slides.length;

  currentIndex += direction;

  if (currentIndex < 0) {
    currentIndex = totalSlides - 1;
  } else if (currentIndex >= totalSlides) {
    currentIndex = 0;
  }

  updateCarousel();
}
/*---------------------------------- Get Genres from genres.json----------------------------------*/
$(document).ready(function () {
  $.getJSON("../stylesheet/genres.json", function (data) {
    const container = $("#categories");
    data.genres.forEach(function (genre) {
      const category = `
        <div class="category">
          ${genre.name}
          <div class="category-info">
            ${genre.info}
          </div>
        </div>
      `;

      container.append(category);
    });
  });
});
