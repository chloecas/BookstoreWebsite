function loadCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartItems = document.getElementById("cartItems");
    let cartSummary = document.getElementById("cartSummary");

    // when empty
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Add some books to see them here</p>
            </div>
        `;

        cartSummary.innerHTML = "";
        return;
    }

    //when not empty yay
    let total = 0;
    let totalItems = 0;

    cartItems.innerHTML = "";

    cart.forEach((item, index) => {
        let subtotal = item.price * item.quantity;
        total += subtotal;
        totalItems += item.quantity;

        cartItems.innerHTML += `
            <div class="cart-row">
                <img src="../${item.image}">
                
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>$${item.price}</p>
                </div>

                <div class="quantity">
                    <button onclick="changeQty(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQty(${index}, 1)">+</button>
                </div>

                <div class="subtotal">$${subtotal.toFixed(2)}</div>

                <button onclick="removeItem(${index})">❌</button>
            </div>
        `;
    });

    cartSummary.innerHTML = `
        <h2>Order Summary</h2>

        <div class="summary-row">
            <span>Items</span>
            <span>${totalItems}</span>
        </div>

        <div class="summary-row">
            <span>Subtotal</span>
            <span>$${total.toFixed(2)}</span>
        </div>

        <div class="summary-row total">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </div>

        <button class="checkout-btn">Proceed to Checkout</button>
    `;
}

loadCart();

function changeQty(index, amount) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCart();
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCart();
}

