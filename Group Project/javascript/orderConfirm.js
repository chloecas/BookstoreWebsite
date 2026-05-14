function loadOrderConfirmation() {
    const orderData = JSON.parse(localStorage.getItem("orderData"));
    const summary = document.getElementById("summary");

    // no order found
    if (!orderData) {
        summary.innerHTML = `
            <h2>No order found</h2>
        `;
        return;
    }

    // build items html
    let itemsHTML = "";

    orderData.items.forEach(item => {
        let itemSubtotal = item.price * item.quantity;

        itemsHTML += `
            <div class="orderItem">
                <img src="../${item.image}" width="80">

                <div class="itemInfo">
                    <h3>${item.name}</h3>
                    <p>
                        Price: $${item.price}
                    </p>
                    <p>
                        Quantity: ${item.quantity}
                    </p>
                    <p>
                        Subtotal:
                        $${itemSubtotal.toFixed(2)}
                    </p>
                </div>
            </div>
        `;
    });

    // display everything
    summary.innerHTML = `
    <div class="pageSummary">
        <div class="confirmationHeader">
            <h1>Review Your Order!</h1>
            <p>Order <strong>${orderData.orderNumber}</strong> processed </p>
            <span class="status">Processing</span>   
        </div>

        <div class="layout">
            <div class="leftSide">
                <div class="card">
                    <h2>Items</h2>
                    ${itemsHTML}
                </div>

                <div class="panel">
                    <a href="../home.html">← Back to home</a>
                    <input type="button" value="Confirm Order" id="confirm" onclick="confirmed()">
                </div>
            </div>

            <div class="rightSide">
                <div class="card">
                    <h2>Customer Information</h2> 
                        <p> ${orderData.customer}</p>
                        <p> ${orderData.email}</p>
                        <p>${orderData.phone}</p>
                </div>

                <div class="card">
                    <h2>Order Summary</h2>
                    
                    <div class="Srow">
                        <span>Subtotal</span>
                        <span>$${orderData.subtotal.toFixed(2)}</span>
                    </div>

                    <div class="Srow">
                        <span>Delivery</span>
                        <span>${orderData.deliveryFee === 0 ? "FREE" : `$${orderData.deliveryFee.toFixed(2)}`}</span>
                    </div>

                     <div class="Srow">
                        <span>GST</span>
                        <span>$${orderData.gst.toFixed(2)}</span>
                    </div>

                    <div class="Srow"><span>QST</span>
                        <span> $${orderData.qst.toFixed(2)}</span>
                    </div>

                    <div class="total">
                        <span>Total</span>
                        <span> $${orderData.finalTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

function confirmed() {
    alert("Order Placed! Thank You!");
    window.location.href="../home.html";
}

loadOrderConfirmation();