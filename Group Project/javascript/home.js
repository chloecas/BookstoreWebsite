/*---------------------------------- Global ressources ----------------------------------*/
let currentIndex = 0;
let index = 0;
const hero = document.querySelector(".hero");
const viewport = document.querySelector(".carousel-viewport");
const track = document.getElementById("track");

const images = [
  "img/home-imageSlider/khanh-do-Ubs4WISHgr4-unsplash.jpg",
  "img/home-imageSlider/aaron-burden-y02jEX_B0O0-unsplash.jpg",
  "img/home-imageSlider/thomas-kelley-hHL08lF7Ikc-unsplash.jpg",
  "img/home-imageSlider/melody-zimmerman-INr3HbMSMSw-unsplash.jpg",
  "img/home-imageSlider/benjamin-raffetseder-LyOz2jJdCY8-unsplash.jpg",
  "img/home-imageSlider/k-h-jG-rhs1S4xE-unsplash.jpg",
  "img/home-imageSlider/debby-hudson-DR31squbFoA-unsplash.jpg"
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
  $.getJSON("genres.json", function (data) {
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

/*---------------------------------- Search bar logic ----------------------------------*/
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchButton");
const suggestions = document.getElementById("suggestions");

let books = [];

// LOAD DATA
fetch("productList.json")
    .then(res => res.json())
    .then(data => {
        books = data;
        console.log("Books loaded:", books);
    })
    .catch(err => console.error("Error loading books:", err));


// LIVE SUGGESTIONS
searchInput.addEventListener("input", () => {

    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        suggestions.innerHTML = "";
        return;
    }

    const filtered = books.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.genre.toLowerCase().includes(query)
    );

    renderSuggestions(filtered, query);
});


// SEARCH BUTTON → GO TO NEW PAGE
searchBtn.addEventListener("click", () => {

    const query = searchInput.value.trim();

    if (!query) return;

    window.location.href =
        `pages/searchResults.html?q=${encodeURIComponent(query)}`;

    suggestions.innerHTML = "";
});


// RENDER SUGGESTIONS
function renderSuggestions(data, query) {

    suggestions.innerHTML = "";

    data.slice(0, 5).forEach(book => {

        const li = document.createElement("li");

        li.innerHTML = highlightText(book.title, query);

        li.addEventListener("click", () => {

            window.location.href =
                `pages/searchResults.html?q=${encodeURIComponent(book.title)}`;

        });

        suggestions.appendChild(li);
    });
}


// HIGHLIGHT MATCHES
function highlightText(text, query) {

    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");

    return text.replace(regex, "<mark>$1</mark>");
}
