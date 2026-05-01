let allProducts = [];

async function displayProducts() {
    const response = await fetch('../productList.json');
    allProducts = await response.json();
    createProductCards(allProducts);
}

function createProductCards(products){
const page = document.getElementById('productList');
page.innerHTML = "";

products.forEach(item => {
    const card = document.createElement('div');
    card.classList.add('card');

    card.innerHTML = `
    <a href="../pages/productDetail.html?id=${item.id}">
    <img src="../${item.image}" alt="${item.title}" class="cardImg">
    </a>
    <div class="cardContent">
        <h3>${item.title}</h3>
        <p>${item.author} (${item.release_year})</p>
        <p class="price">$${item.price.toFixed(2)} CAD</p>
        <label>Quantity</label>
        <input type="number" id="quantity" name="quantity" min="1" max="5">
        <button>Add To Cart</button>

    </div>
    `;

    card.querySelector('button')
    .addEventListener('click', () => addToCart(item));

    page.appendChild(card);
    });
}

function applyFilter() {
    const genre = document.getElementById('genreFilter').value;
    const maxPrice = parseFloat(document.getElementById('priceFilter').value) || Infinity;

    const filtered = allProducts.filter(item => {
        const matchGenre = genre == "all" || item.genre.toLowerCase() == genre.toLowerCase();
        const matchPrice = item.price <= maxPrice;

        return matchGenre && matchPrice;
    });

    createProductCards(filtered);
}

document.addEventListener('DOMContentLoaded', async () => {
    await displayProducts();

    document.getElementById('genreFilter')
    .addEventListener('change', applyFilter);

    document.getElementById('priceFilter')
    .addEventListener('input', (e) => {
        document.getElementById('priceValue').textContent = e.target.value;
        applyFilter();
    });
});








