const results = document.getElementById("results");
const searchTitle = document.getElementById("searchTitle");

let books = [];

// GET QUERY FROM URL
const params = new URLSearchParams(window.location.search);
const query = params.get("q")?.toLowerCase() || "";

// SHOW TITLE
searchTitle.textContent = `Results for "${params.get("q")}"`;


// LOAD DATA
fetch("../productList.json")
    .then(res => res.json())
    .then(data => {
        books = data;
        renderResults();
    })
    .catch(err => console.error(err));


// RENDER RESULTS
function renderResults() {

    const filtered = books
  .filter(book => book.title.toLowerCase().includes(query))
  .sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();

    return aTitle.indexOf(query) - bTitle.indexOf(query);
  });

    if (filtered.length === 0) {
        results.innerHTML = "<p>No books found.</p>";
        return;
    }

    filtered.forEach(book => {

        const div = document.createElement("div");

        div.classList.add("result-item");

        div.innerHTML = `
            <img src="../${book.image}" class="search-book-image">

            <div class="search-book-info">

                <h2>${highlightText(book.title)}</h2>

                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Genre:</strong> ${book.genre}</p>
                <p><strong>Price:</strong> $${book.price}</p>

            </div>
        `;

        div.addEventListener("click", () => {
            window.location.href =
                `../pages/productDetail.html?id=${book.id}`;
        });

        results.appendChild(div);
    });
}


// HIGHLIGHT
function highlightText(text) {

    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");

    return text.replace(regex, "<mark>$1</mark>");
}