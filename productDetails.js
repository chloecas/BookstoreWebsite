let allProducts = [];

let allReviews =[];

async function loadReviews() {
    const response = await fetch('ratingsReviews.json');
    allReviews = await response.json();
}

async function loadDetails(id) {
    const response = await fetch('productList.json');
    allProducts = await response.json();

    const product = allProducts.find(p => p.id == id);
    const container = document.getElementById('productDetails');

    if(!product){
        container.innerHTML = "<p>Product Not Found</p>";
        return;
    }

    container.innerHTML = `
    <h2 id="prodTitle">${product.title}</h2>
    <img src="${product.image}" class="productImage" alt="${product.title}">
    <p id="author">${product.author} (${product.release_year})</p>
    <p id="price">$${product.price.toFixed(2)} CAD</p>
    <p id="description">${product.description || ""}</p>
    `;
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

document.addEventListener('DOMContentLoaded', async () => {
    const parameter = new URLSearchParams(window.location.search);
    const productId = parameter.get("id");

    await loadReviews();
    loadDetails(productId);
    getReviews(productId);
});
