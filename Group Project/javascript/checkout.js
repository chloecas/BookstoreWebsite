const countrySelect = document.getElementById('country');
const province = document.getElementById('province');
const postal = document.getElementById('postal');
const provinceSelect = document.getElementById('provinceSelect');

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

function loadSummary() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
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
                    <span>Qty: ${item.quantity}</span>
                </div>

                <div class="subtotal">$${subtotal.toFixed(2)}</div> 
            </div>
            
        `;
    });

    let regFee = total >= 25 ? 0 : 4.99;
    let priorityFee = 12.99;

    document.getElementById('regularPrice').textContent =
        regFee === 0 ? "FREE": `$${regFee.toFixed(2)}`;

    let selectedDel = document.querySelector('input[name="delivery"]:checked').value;

    let delFee = selectedDel === "priority" ? priorityFee : regFee;


    let gst = total * 0.05;
    let qst = total * 0.09975;
    let finalTotal = total + delFee + gst + qst;

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
            <span>Delivery</span>
            <span>
                ${delFee === 0 ? "FREE" : `$${delFee.toFixed(2)}`}
            </span>
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
    `;
}

function placeOrder() {
    
    

}

loadSummary();

changeCountry();

countrySelect.addEventListener("change", changeCountry);
document.querySelectorAll('input[name="delivery"]').forEach(radio => {
    radio.addEventListener("change", loadSummary);
});
