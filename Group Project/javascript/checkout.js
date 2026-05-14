const countrySelect = document.getElementById('country');
const province = document.getElementById('province');
const postal = document.getElementById('postal');
const provinceSelect = document.getElementById('provinceSelect');

const nameReg = /^[A-Z](?:[a-z]|-){2,19}$/;
const phoneReg = /^(?:\d[- ]?){9}\d$/;
const emailReg = /^[a-zA-Z0-9][a-zA-Z0-9.-]+@[a-zA-Z]+\.(?:com|ca|org|net)$/;

const zipReg = /^\d{5}(?:-\d{4})?$/;
const postalReg = /^[A-Z]\d[A-Z] \d[A-Z]\d$/;
const postReg = /^\d{4}$/;

const regions = {
    Canada: [
        "Alberta",
        "British Columbia",
        "Manitoba",
        "New Brunswick",
        "Newfoundland",
        "Northwest Territories",
        "Nova Scotia",
        "Nunavut",
        "Prince Edward Island",
        "Quebec",
        "Saskatchewan",
        "Yukon" 
    ],

    USA: [
        "Arizona",
        "California",
        "Colorado",
        "Florida",
        "Illinois",
        "Michigan",
        "Montana",
        "Nevada",
        "New York",
        "North Carolina",
        "Ohio",
        "Pennsylvania",
        "Texas"
    ],

    Australia: [
        "New South Wales",
        "Queensland",
        "Victoria",
        "Western Australia"
    ]
};

function getCookie(name) {
  const key = encodeURIComponent(name) + "=";
  const found = document.cookie.split("; ").find(c => c.startsWith(key));
  return found ? decodeURIComponent(found.slice(key.length)) : null;
}

function changeCountry() {
    const country = countrySelect.value;

    if(country === "Canada") {
        province.textContent = "Province";
        postal.textContent = "Postal Code";
    } else if(country === "Australia"){
        province.textContent = "State/Territory";
        postal.textContent = "Postcode";
    } else {
        province.textContent = "State";
        postal.textContent = "ZIP Code";
    }

    provinceSelect.innerHTML = "";

    regions[country].forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        provinceSelect.appendChild(option);
    });

}

function requireCheckoutAuth() {
  const token = getCookie("authToken");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!token) {
    window.location.href = "../pages/login.html";
    return;
  }

  if (cart.length === 0) {
    window.location.href = "../pages/cart.html";
  }
}

function loadSummary() {
   const order = calculateOrder("","","","");

   let cart = order.items;
    let cartItems = document.getElementById("cartItems");
    let cartSummary = document.getElementById("Summary");

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

    cartItems.innerHTML= "";

    cart.forEach(item => {
        let itemSubtotal = item.price * item.quantity;
         cartItems.innerHTML += `
            <div class="row">
                <img src="../${item.image}">
                
                <div class="itemInfo">
                    <h3>${item.name}</h3>
                    <p>$${item.price}</p>
                </div>

                <div class="quantity">
                    <span>Qty: ${item.quantity}</span>
                </div>

                <div class="subtotal">$${itemSubtotal.toFixed(2)}</div> 
            </div>
            
        `;
    });

    document.getElementById('regularPrice').textContent = 
        order.deliveryFee === 0 ? "FREE" : `$${order.deliveryFee.toFixed(2)}`;

    cartSummary.innerHTML = `
        <h2>Order Summary</h2>

        <div class="Srow">
            <span>Items</span>
            <span>${order.totalItems}</span>
        </div>

        <div class="Srow">
            <span>Subtotal</span>
            <span>$${order.subtotal.toFixed(2)}</span>
        </div>

        <div class="Srow">
            <span>Delivery</span>
            <span> ${order.deliveryFee === 0 ? "FREE" : `$${order.deliveryFee.toFixed(2)}`}</span>
        </div>

        <div class="Srow">
            <span>GST (5%)</span>
            <span>$${order.gst.toFixed(2)}</span>
        </div>

        <div class="Srow">
            <span>QST (9.975%)</span>
            <span>$${order.qst.toFixed(2)}</span>
        </div>

        <div class="total">
            <span>Total:</span>
            <span>$${order.finalTotal.toFixed(2)}</span>
        </div>
    `;
    }

document.getElementById("checkoutForm").addEventListener("submit", function (event) {
    event.preventDefault(); // 🔥 STOPS AUTO REDIRECT

    const name = document.getElementById('fname').value;
    const name2 = document.getElementById('lname').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const code = document.getElementById('code').value;

    if (
        validateName(name) &&
        validateName(name2) &&
        validatePhone(phone) &&
        validateEmail(email) &&
        validatePostal(code)
    ) {
        const order = calculateOrder(name, name2, email, phone);
        localStorage.setItem("orderData", JSON.stringify(order));
        localStorage.removeItem("cart");

        window.location.href = "../pages/orderConfirmation.html";
    } else {
        alert("Please fix errors before continuing.");
    }
});

function calculateOrder(name, name2, email, phone) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let subtotal = 0;
        let totalItems = 0;

            cart.forEach(item => {
                subtotal += item.price * item.quantity;
                totalItems += item.quantity;
            });

        let selectedDel = document.querySelector('input[name="delivery"]:checked').value;

        //delivery is free over 25$ otherwise 4.99
        let regFee = subtotal >= 25 ? 0 : 4.99;
        let priorityFee = 12.99;
        let deliveryFee = selectedDel === "priority" ? priorityFee : regFee;

        let gst = subtotal * 0.05;
        let qst = subtotal * 0.09975;

        let orderNumber = "#" + Math.floor(Math.random() * 1000000);
        let finalTotal = subtotal + deliveryFee + gst + qst;

        const orderData = {
            orderNumber,
            customer: `${name} ${name2}`,
            email,
            phone,
            items: cart,
            totalItems,
            subtotal,
            deliveryFee,
            gst,
            qst,
            finalTotal 
        };

    return orderData;
}

function validateName(name) {
    if(name.match(nameReg)) {
        return true;
    }
    alert("Invalid name format!");
    return false;
}

function validatePhone(phone) {
    if(phone.match(phoneReg)) {
        return true;
    }
    alert("Invalid phone number format! Only accepts 10 digits with a space or hyphen.");
    return false;
}

function validateEmail(email) {
    if(email.match(emailReg)){
        return true;
    }
    alert("Invalid email format!");
    return false;
}

function validatePostal(code) {
    if(postal.textContent === 'ZIP Code') {
        if(code.match(zipReg)){
            return true;
        }
        alert("Invalid ZIP Code!");

    } else if(postal.textContent === 'Postal Code') {
        if(code.match(postalReg)) {
            return true;
        }
        alert("Invalid Postal Code!");

    } else {
        if(code.match(postReg)){
            return true;
        }
        alert("Invalid Postcode!");
    }
    return false;
}

document.addEventListener("DOMContentLoaded", () => {
    requireCheckoutAuth();

    loadSummary();
    changeCountry();

    countrySelect.addEventListener("change", changeCountry);
    document.querySelectorAll('input[name="delivery"]').forEach(radio => {
        radio.addEventListener("change", loadSummary);
    });
});



