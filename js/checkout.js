/* =========================================================
   PN SHOES STORE - CHECKOUT
   ========================================================= */

"use strict";

const CART_KEY = "pnShoesCart";
const ORDER_KEY = "pnShoesOrders";

function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem(CART_KEY));
        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        console.error("Could not load cart:", error);
        return [];
    }
}

function saveOrders(orders) {
    localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
}

function getOrders() {
    try {
        const orders = JSON.parse(localStorage.getItem(ORDER_KEY));
        return Array.isArray(orders) ? orders : [];
    } catch (error) {
        return [];
    }
}

function formatPrice(price) {
    return (
        new Intl.NumberFormat("en-RW").format(Number(price) || 0) +
        " RWF"
    );
}

function getElement(...ids) {
    for (const id of ids) {
        const element = document.getElementById(id);
        if (element) return element;
    }

    return null;
}

function getCustomerData() {
    const name = getElement(
        "customerName",
        "fullName",
        "name"
    )?.value.trim() || "";

    const email = getElement(
        "customerEmail",
        "email"
    )?.value.trim() || "";

    const phone = getElement(
        "customerPhone",
        "phone"
    )?.value.trim() || "";

    const address = getElement(
        "customerAddress",
        "address"
    )?.value.trim() || "";

    const city = getElement(
        "customerCity",
        "city"
    )?.value.trim() || "";

    const payment = getElement(
        "paymentMethod",
        "payment"
    )?.value || "";

    return {
        name,
        email,
        phone,
        address,
        city,
        payment
    };
}

function calculateTotals(cart) {
    let subtotal = 0;

    cart.forEach(item => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;

        subtotal += price * quantity;
    });

    const shipping = subtotal > 0 ? 0 : 0;
    const total = subtotal + shipping;

    return {
        subtotal,
        shipping,
        total
    };
}

function displayCheckoutSummary() {
    const cart = getCart();

    const itemsContainer = getElement(
        "checkoutItems",
        "orderItems",
        "checkoutProducts"
    );

    const subtotalElement = getElement(
        "checkoutSubtotal",
        "subtotal"
    );

    const shippingElement = getElement(
        "checkoutShipping",
        "shipping"
    );

    const totalElement = getElement(
        "checkoutTotal",
        "total"
    );

    if (!itemsContainer) return;

    itemsContainer.innerHTML = "";

    if (cart.length === 0) {
        itemsContainer.innerHTML = `
            <div class="empty-checkout">
                <h3>Your cart is empty</h3>
                <p>Please add shoes to your cart before checking out.</p>
                <a href="shop.html">Continue Shopping</a>
            </div>
        `;

        if (subtotalElement) {
            subtotalElement.textContent = formatPrice(0);
        }

        if (shippingElement) {
            shippingElement.textContent = formatPrice(0);
        }

        if (totalElement) {
            totalElement.textContent = formatPrice(0);
        }

        return;
    }

    cart.forEach(item => {
        const quantity = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;

        const itemElement = document.createElement("div");
        itemElement.className = "checkout-item";

        itemElement.innerHTML = `
            <div class="checkout-item-image">
                <img
                    src="${item.image || "images/placeholder.jpg"}"
                    alt="${escapeHTML(item.name || "Shoe")}"
                >
            </div>

            <div class="checkout-item-info">
                <h4>${escapeHTML(item.name || "Shoe")}</h4>
                <p>Quantity: ${quantity}</p>
                <strong>${formatPrice(price * quantity)}</strong>
            </div>
        `;

        itemsContainer.appendChild(itemElement);
    });

    const totals = calculateTotals(cart);

    if (subtotalElement) {
        subtotalElement.textContent =
            formatPrice(totals.subtotal);
    }

    if (shippingElement) {
        shippingElement.textContent =
            totals.shipping === 0
                ? "FREE"
                : formatPrice(totals.shipping);
    }

    if (totalElement) {
        totalElement.textContent =
            formatPrice(totals.total);
    }
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function validateCustomerData(data) {
    if (!data.name) {
        return "Please enter your full name.";
    }

    if (!data.email) {
        return "Please enter your email.";
    }

    if (!data.phone) {
        return "Please enter your phone number.";
    }

    if (!data.address) {
        return "Please enter your delivery address.";
    }

    if (!data.city) {
        return "Please enter your city.";
    }

    if (!data.payment) {
        return "Please select a payment method.";
    }

    return "";
}

function showCheckoutMessage(message, type = "error") {
    const messageBox = getElement(
        "checkoutMessage",
        "formMessage",
        "message"
    );

    if (!messageBox) {
        alert(message);
        return;
    }

    messageBox.textContent = message;
    messageBox.className =
        "checkout-message " + type;
}

function createOrder() {
    const cart = getCart();

    if (cart.length === 0) {
        showCheckoutMessage(
            "Your cart is empty.",
            "error"
        );
        return;
    }

    const customer = getCustomerData();

    const validationError =
        validateCustomerData(customer);

    if (validationError) {
        showCheckoutMessage(
            validationError,
            "error"
        );
        return;
    }

    const totals = calculateTotals(cart);

    const order = {
        id:
            "PN-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 7)
                .toUpperCase(),

        customer,

        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            image: item.image || ""
        })),

        subtotal: totals.subtotal,
        shipping: totals.shipping,
        total: totals.total,

        status: "Pending",

        createdAt:
            new Date().toISOString()
    };

    const orders = getOrders();

    orders.push(order);

    saveOrders(orders);

    localStorage.removeItem(CART_KEY);

    showCheckoutMessage(
        "Order placed successfully!",
        "success"
    );

    setTimeout(() => {
        window.location.href =
            "account.html?order=" +
            encodeURIComponent(order.id);
    }, 1200);
}

function setupCheckoutForm() {
    const form = getElement(
        "checkoutForm",
        "orderForm"
    );

    if (!form) return;

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        createOrder();
    });
}

document.addEventListener(
    "DOMContentLoaded",
    function() {
        displayCheckoutSummary();
        setupCheckoutForm();

        console.log(
            "PN Shoes checkout loaded successfully."
        );
    }
);