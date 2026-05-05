let allProducts = [];

let allReviews =[];

async function loadReviews() {
    const response = await fetch('../ratingsReviews.json');
    allReviews = await response.json();
}


async function loadDetails(id) {
    const response = await fetch('../productList.json');
    allProducts = await response.json();

    const product = allProducts.find(p => p.id == id);
    const container = document.getElementById('productDetails');

    if(!product){
        container.innerHTML = "<p>Product Not Found</p>";
        return;
    }

    container.innerHTML = `
    <h2 id="prodTitle">${product.title}</h2>
    <img src="../${product.image}" class="productImage" alt="${product.title}">
    <p id="author">${product.author} (${product.release_year})</p>
    <p id="price">$${product.price.toFixed(2)} CAD</p>
    <p id="description">${product.description || ""}</p>
    
    <div class="buttonPanel">
        <button class="detailsButton checkout" type="button"> Checkout</button>
        <label>Quantity:</label>
            <input type="number" class="quantityInput" id="quantity" name="quantity" min="1" max="5" placeholder="1">
        <button class="detailsButton addCart" type="button">Add To Cart</button>
    </div>
    `;

    const checkoutButton = container.querySelector('.checkout');
    checkoutButton.addEventListener('click', () => {
        window.location.href = "../pages/shoppingCart.html";
    });

    const qtyInput = container.querySelector('.quantityInput');
    const addButton = container.querySelector('.addCart');
    addButton.addEventListener('click', () => {
    const quantity = parseInt(qtyInput.value) || 1;
    addToCart(product, quantity);
    });

    return product;
}

async function getReviews(id) {
    const productData = allReviews.find(r => r.id == id);
    const container = document.getElementById('reviews');

    container.innerHTML="";

    if(!productData || !productData.reviews) {
        container.innerHTML = "<p>No Reviews Found</p>";
        return;
    }

    productData.reviews.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');

        card.innerHTML= `
        <p class="user">${item.username}</p>
        <p class="comment">${item.comment}</p>
        `;

        container.appendChild(card);
    });
}

async function getRatings(id) {
    const productRating = allReviews.find(r => r.id == id);
    const container = document.getElementById('ratingCard');

    container.innerHTML = "";

    if(!productRating) {
        container.innerHTML="<p>No Rating Found</p>";
        return;
    }

    const rating = productRating.rating;
    const rounded = Math.floor(rating * 2)/2;
    const imagePath = `../img/${rounded}.png`;

    container.innerHTML = `
    <h2 class="numberRating">${productRating.rating}</h2>
    <img class="stars" src="${imagePath}" alt="star rating">
    `;
}

 async function loadRelated(genre, currentId){
    const response = await fetch('../productList.json');
    allProducts = await response.json();

    const container = document.getElementById('bookCarousel');
    container.innerHTML ="";
    
    const products = allProducts.filter(p => p.genre == genre && p.id != currentId);

    if(products.length == 0){
        container.innerHTML="<p>No Products Found</p>";
        return;
    }

    const maxItems = Math.min(products.length, 3);

    for(let i = 0; i < maxItems; i++){
        const item = products[i];
        const cardBooks = document.createElement('div');
        cardBooks.classList.add('cardBooks');

        cardBooks.innerHTML = `  
        <a href="/pages/productDetail.html?id=${item.id}">
            <img src="../${item.image}" alt="${item.title}" class="cardImg">
        </a>
         <div class="cardContent">
            <h3>${item.title}</h3>
            <p>${item.author} (${item.release_year})</p>
        </div>
        `;

        container.appendChild(cardBooks);
    }
} 

document.addEventListener('DOMContentLoaded', async () => {
    const parameter = new URLSearchParams(window.location.search);
    const productId = parameter.get("id");

    await loadReviews();
    const product = await loadDetails(productId);
    getReviews(productId);
    getRatings(productId);
    loadRelated(product.genre, product.id);
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
