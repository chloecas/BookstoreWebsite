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
    <img src="../${item.image}" alt="${item.title}" class="cardImg" alt="${item.title}+ cover">
    </a>
    <div class="cardContent">
        <h3>${item.title}</h3>
        <p>${item.author} (${item.release_year})</p>
        <p class="price">$${item.price.toFixed(2)} CAD</p>
        <label>Quantity</label>
        <input type="number" id="quantity" name="quantity" min="1" max="5" placeholder="1">
        <button>Add To Cart</button>

    </div>
    `;

    const qtyInput = card.querySelector('#quantity');
    card.querySelector('button')
    .addEventListener('click', () => {
    const quantity = parseInt(qtyInput.value) || 1;
    addToCart(item, quantity);
    });

    page.appendChild(card);
    });
}

function applyFilter() {
    const genre = document.getElementById('genreFilter').value;
    const maxPrice = parseFloat(document.getElementById('priceFilter').value) || Infinity;

    let filtered = allProducts.filter(item => {
        const matchGenre = genre == "all" || item.genre.toLowerCase() == genre.toLowerCase();
        const matchPrice = item.price <= maxPrice;

        return matchGenre && matchPrice;
    });

    filtered = sortProducts(filtered);

    createProductCards(filtered);
}

function sortProducts(products) {
    const highLow = document.getElementById('highLow').checked;
    const lowHigh = document.getElementById('lowHigh').checked;

    if(highLow) {
        return products.slice().sort((a,b) => b.price - a.price);
    } else if(lowHigh){
        return products.slice().sort((a,b) => a.price - b.price);
    }

    return products;
}

document.addEventListener('DOMContentLoaded', async () => {
    await displayProducts();

    document.getElementById('genreFilter')
    .addEventListener('change', applyFilter);

    document.querySelectorAll('input[name="sorting"]').forEach(radio => {
        radio.addEventListener('change', applyFilter);
    });

    document.getElementById('priceFilter')
    .addEventListener('input', (e) => {
        document.getElementById('priceValue').textContent = e.target.value;
        applyFilter();
    });
});

function addToCart(item, quantity) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let existing = cart.find(p => p.id === item.id);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: item.id,
            name: item.title,
            price: item.price,
            image: item.image,
            quantity: quantity
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
}





