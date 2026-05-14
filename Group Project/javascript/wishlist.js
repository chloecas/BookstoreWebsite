//__________________________________cookie methods_________________________________
function getCookie(name) {

    const cookies =
        document.cookie.split("; ");

    for (let cookie of cookies) {

        const parts =
            cookie.split("=");

        const cookieName =
            parts[0];

        const cookieValue =
            parts[1];

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

    const wishlistKey = "wishlist_" + userId;
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
    const wishlistKey = "wishlist_" + userId;

    const bookId = $(this).data("id");

    let wishlist = getWishlist(wishlistKey);
    wishlist = wishlist.filter(id => id !== bookId);

    setCookie(wishlistKey, JSON.stringify(wishlist), 7);

    $(this).closest(".wishlist-item").remove();

    if (wishlist.length === 0) {
        $("#wishlistContainer").html("<p>Your wishlist is empty.</p>");
    }
});

function setCookie(name, value, days) {
    const date = new Date();
    date.setDate(date.getDate() + days);

    document.cookie =
        name + "=" + encodeURIComponent(value) +
        "; expires=" + date.toUTCString() +
        "; path=/";
}

function getCookie(name) {
    const cookies = document.cookie.split("; ");

    for (let cookie of cookies) {
        const parts = cookie.split("=");
        const cookieName = parts[0];
        const cookieValue = parts[1];

        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }

    return "";
}

function getWishlist(key) {
    const cookieValue = getCookie(key);

    if (!cookieValue) {
        return [];
    }

    return JSON.parse(cookieValue);
}
