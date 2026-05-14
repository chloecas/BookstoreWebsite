//__________________________________cookie methods_________________________________
function getCookie(name) {
    const cookies =
        document.cookie.split("; ");

    for (let cookie of cookies) {
        const parts = cookie.split("=");
        const cookieName = parts[0];
        const cookieValue = parts[1];

        if (cookieName === name) {
            return decodeURIComponent(
                cookieValue
            );
        }
    }

    return "";
}
function setCookie(name, value, days) {

    const date = new Date();

    date.setDate(
        date.getDate() + days
    );

    document.cookie =
        name + "=" +
        encodeURIComponent(value) +
        ";expires=" +
        date.toUTCString() +
        ";path=/";
}
function getWishlist(key) {
    const cookieValue =
        getCookie(key);

    if (!cookieValue) {
        return [];
    }
    return JSON.parse(
        cookieValue
    );
}

let allProducts = [];

async function displayProducts() {
    const response = await fetch('../productList.json');
    allProducts = await response.json();
    createProductCards(allProducts);
}

function createProductCards(products) {
    const page = document.getElementById('productList');
    page.innerHTML = "";

    products.forEach(item => {
        const userId = getCookie("userEmail");
        const wishlistKey = "wishlist_" + userId;
        const wishlist = getWishlist(wishlistKey).map(Number);
        const isInWishlist = wishlist
            .map(id => String(id).trim())
            .includes(String(item.id).trim());
        const card = document.createElement('div');


        card.classList.add('card');

        card.innerHTML = `
            <a href="../pages/productDetail.html?id=${item.id}">
                <img src="../${item.image}" 
                    alt="${item.title} cover" 
                    class="cardImg">
            </a>

            <div class="cardContent">
                <h3>${item.title}</h3>
                <p>${item.author} (${item.release_year})</p>
                <p class="price">$${item.price.toFixed(2)} CAD</p>

                <label>Quantity</label>

                <input type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    max="5"
                    placeholder="1">

                <button type="button">
                    Add To Cart
                </button>
            </div>

        
            <button type="button"
        class="wishlist-btn ${isInWishlist ? "active-heart" : ""}"
        data-id="${item.id}"
        data-title="${item.title}">
        ${isInWishlist ? "❤️" : "🩶"}
        </button>
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

$(document).on("click", ".wishlist-btn", function () {
    const bookId = $(this).data("id");
    const bookTitle = $(this).data("title");
    const userId = getCookie("userEmail");


    if (!userId) {
        alert("Please log in first.");
        window.location.href = "../pages/login.html";
        return;
    }

    const wishlistKey = "wishlist_" + userId;
    let wishlist = getWishlist(wishlistKey);

    if (!wishlist.includes(bookId)) {
        wishlist.push(bookId);
        setCookie(wishlistKey, JSON.stringify(wishlist), 7);

        $(this).html("❤️").addClass("active-heart");
        alert(bookTitle + " added to wishlist!");
    } else {
        wishlist = wishlist.filter(id => id !== bookId);
        setCookie(wishlistKey, JSON.stringify(wishlist), 7);

        $(this).html("🩶").removeClass("active-heart");
        alert(bookTitle + " removed from wishlist.");
    }
});

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

    if (highLow) {
        return products.slice().sort((a, b) => b.price - a.price);
    } else if (lowHigh) {
        return products.slice().sort((a, b) => a.price - b.price);
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





