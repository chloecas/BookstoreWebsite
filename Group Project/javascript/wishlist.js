//__________________________________cookie methods_________________________________
function getCookie(name) {
    const encodedName = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split("; ");

    for (let cookie of cookies) {
        if (cookie.startsWith(encodedName)) {
            return decodeURIComponent(cookie.substring(encodedName.length));
        }
    }

    return "";
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setDate(date.getDate() + days);

    document.cookie =
        encodeURIComponent(name) + "=" +
        encodeURIComponent(value) +
        ";expires=" + date.toUTCString() +
        ";path=/";
}

function getWishlistKey() {
    const userId = getCookie("userEmail");

    if (!userId) {
        return null;
    }

    return "wishlist_" + userId;
}

function getWishlist(key) {
    const value = getCookie(key);

    if (!value) {
        return [];
    }

    return JSON.parse(value);
}

//__________________________________wishlist logic_________________________________
$(document).ready(function () {
    const userId = getCookie("userEmail");

    if (!userId) {
        $("#wishlistContainer").html(`
            <p>Please log in to view your wishlist.</p>
            <a href="../pages/login.html">Go to Login</a>
        `);
        return;
    }

    const wishlistKey = getWishlistKey();
    const wishlistIds = getWishlist(wishlistKey);

    if (wishlistIds.length === 0) {
        $("#wishlistContainer").html("<p>Your wishlist is empty.</p>");
        return;
    }

    fetch("../productList.json")
    .then(res => res.json())
    .then(data => {

        const books = data.products || data; 

        const matchedBooks = books.filter(book =>
            wishlistIds.map(Number).includes(Number(book.id))
        );

        displayWishlist(matchedBooks, wishlistKey);
    })
    .catch(err => console.error("Could not load wishlist:", err));
});

function displayWishlist(books, wishlistKey) {
    const container = $("#wishlistContainer");
    container.empty();

    books.forEach(book => {
        container.append(`
            <div class="wishlist-item">
                <img src="../${book.image}" alt="${book.title} cover">

                <div>
                    <h2>${book.title}</h2>
                    <p>${book.author}</p>
                    <p>$${book.price.toFixed(2)} CAD</p>

                    <button type="button"
                            class="remove-wishlist-btn"
                            data-id="${book.id}">
                        Remove
                    </button>
                </div>
            </div>
        `);
    });
}

$(document).on("click", ".remove-wishlist-btn", function () {
    const userId = getCookie("userEmail");
    const wishlistKey = getWishlistKey();

    const bookId = Number($(this).data("id"));

    let wishlist = getWishlist(wishlistKey).map(Number);
    wishlist = wishlist.filter(id => id !== bookId);

    setCookie(wishlistKey, JSON.stringify(wishlist), 7);

    $(this).closest(".wishlist-item").remove();

    if (wishlist.length === 0) {
        $("#wishlistContainer").html("<p>Your wishlist is empty.</p>");
    }
});


