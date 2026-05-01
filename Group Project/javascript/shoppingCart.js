function loadCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartItems = document.getElementById("cartItems");
    let cartSummary = document.getElementById("Summary");

    // when empty
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="emptyCart">
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
            <div class="row">
                <img src="../${item.image}">
                
                <div class="itemInfo">
                    <h3>${item.name}</h3>
                    <p>$${item.price}</p>
                </div>

                <div class="quantity">
                    <button onclick="changeQty(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQty(${index}, 1)">+</button>
                </div>

                <div class="subtotal">$${subtotal.toFixed(2)}</div>

                <button onclick="removeItem(${index})">✖</button>
            </div>
        `;
    });

    let gst = total * 0.05;
    let qst = total * 0.09975;
    let finalTotal = total + gst + qst;

    cartSummary.innerHTML = `
        <h2>Order Summary</h2>

        <div class="Srow">
            <span>Items</span>
            <span>${totalItems}</span>
        </div>

        <div class="Srow">
            <span>Subtotal</span>
            <span>$${total.toFixed(2)}</span>
        </div>

        <div class="Srow">
            <span>GST (5%)</span>
            <span>$${gst.toFixed(2)}</span>
        </div>

        <div class="Srow">
            <span>QST (9.975%)</span>
            <span>$${qst.toFixed(2)}</span>
        </div>

        <div class="total">
            <span>Total:</span>
            <span>$${finalTotal.toFixed(2)}</span>
        </div>

        <button class="checkoutBtn">Proceed to Checkout</button>
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

