/*---------------------------------- Search bar logic ----------------------------------*/
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchButton");
const suggestions = document.getElementById("suggestions");

let searchBooks = [];

const isInsidePages =
    window.location.pathname.includes("/pages/");

const jsonPath = isInsidePages
    ? "../productList.json"
    : "productList.json";

const resultsPath = isInsidePages
    ? "../pages/searchResults.html"
    : "pages/searchResults.html";

// LOAD DATA
fetch(jsonPath)
    .then(res => res.json())
    .then(data => {
        searchBooks = data;
        console.log("Books loaded:", searchBooks);
    })
    .catch(err => console.error("Error loading books:", err));


// LIVE SUGGESTIONS
searchInput.addEventListener("input", () => {

    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        suggestions.innerHTML = "";
        return;
    }

    const filtered = searchBooks.filter(book =>
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
            `${resultsPath}?q=${encodeURIComponent(query)}`;

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
                `${resultsPath}?q=${encodeURIComponent(book.title)}`;

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

