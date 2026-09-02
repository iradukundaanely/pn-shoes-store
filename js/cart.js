// ======================================================
// PN SHOES STORE - CART SYSTEM
// Complete replacement cart.js
// ======================================================

const PN_CART_KEY = "pn_cart";

// ======================================================
// CART STORAGE
// ======================================================

function loadCart() {
    try {
        const savedCart = localStorage.getItem(PN_CART_KEY);

        if (!savedCart) {
            return [];
        }

        const cart = JSON.parse(savedCart);

        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        console.error("❌ Error loading cart:", error);
        return [];
    }
}


function saveCart(cart) {
    try {
        localStorage.setItem(PN_CART_KEY, JSON.stringify(cart));

        // Keep PNStore compatible if another part of the website uses it
        if (typeof PNStore !== "undefined" && PNStore) {
            PNStore.cart = cart;
        }

        return true;
    } catch (error) {
        console.error("❌ Error saving cart:", error);
        return false;
    }
}


// ======================================================
// PRODUCT ID HELPER
// ======================================================

// IMPORTANT:
// Product IDs are strings such as "PN001", "PN002", etc.
// Never convert them to Number().

function sameProductId(id1, id2) {
    return String(id1) === String(id2);
}


// ======================================================
// ADD TO CART
// ======================================================

function addToCart(productId, quantity = 1, size = null) {

    const product = getProductById(String(productId));

    if (!product) {
        console.error("❌ Product not found:", productId);
        alert("Sorry, this product could not be found.");
        return false;
    }

    quantity = Number(quantity);

    if (!Number.isFinite(quantity) || quantity < 1) {
        quantity = 1;
    }

    // Make sure size is a string or null
    size = size !== null && size !== undefined
        ? String(size)
        : null;

    const cart = loadCart();

    // Find same product + same size
    const existingItem = cart.find(item =>
        sameProductId(item.productId, product.id) &&
        String(item.size ?? "") === String(size ?? "")
    );

    if (existingItem) {

        existingItem.quantity =
            Number(existingItem.quantity || 0) + quantity;

    } else {

        cart.push({
            productId: String(product.id),
            name: product.name,
            price: Number(product.price) || 0,
            image: product.image || "",
            size: size,
            quantity: quantity
        });
    }

    if (!saveCart(cart)) {
        alert("Could not save the cart. Please try again.");
        return false;
    }

    updateCartCount();

    // If the cart page is currently open, refresh it
    if (typeof renderCart === "function") {
        renderCart();
    }

    console.log("✅ Added to cart:", product.name);

    return true;
}


// ======================================================
// REMOVE FROM CART
// ======================================================

function removeFromCart(productId, size = null) {

    let cart = loadCart();

    const oldLength = cart.length;

    cart = cart.filter(item => {

        const sameId =
            sameProductId(item.productId, productId);

        const sameSize =
            String(item.size ?? "") === String(size ?? "");

        // Remove only matching product + size
        return !(sameId && sameSize);
    });

    if (cart.length === oldLength) {
        console.warn(
            "⚠️ Cart item not found:",
            productId,
            size
        );
        return false;
    }

    saveCart(cart);

    updateCartCount();

    renderCart();

    console.log("🗑️ Removed from cart:", productId);

    return true;
}


// ======================================================
// INCREASE QUANTITY
// ======================================================

function increaseCartQuantity(productId, size = null) {

    const cart = loadCart();

    const item = cart.find(item =>
        sameProductId(item.productId, productId) &&
        String(item.size ?? "") === String(size ?? "")
    );

    if (!item) {
        console.warn("⚠️ Cart item not found:", productId);
        return false;
    }

    item.quantity = Number(item.quantity || 0) + 1;

    saveCart(cart);

    updateCartCount();
    renderCart();

    return true;
}


// ======================================================
// DECREASE QUANTITY
// ======================================================

function decreaseCartQuantity(productId, size = null) {

    const cart = loadCart();

    const item = cart.find(item =>
        sameProductId(item.productId, productId) &&
        String(item.size ?? "") === String(size ?? "")
    );

    if (!item) {
        console.warn("⚠️ Cart item not found:", productId);
        return false;
    }

    item.quantity = Number(item.quantity || 0) - 1;

    // If quantity reaches zero, remove the item
    if (item.quantity <= 0) {

        const updatedCart = cart.filter(cartItem =>
            !(
                sameProductId(cartItem.productId, productId) &&
                String(cartItem.size ?? "") === String(size ?? "")
            )
        );

        saveCart(updatedCart);

    } else {

        saveCart(cart);
    }

    updateCartCount();
    renderCart();

    return true;
}


// ======================================================
// UPDATE CART QUANTITY
// ======================================================

function updateCartQuantity(productId, quantity, size = null) {

    quantity = Number(quantity);

    if (!Number.isFinite(quantity)) {
        return false;
    }

    const cart = loadCart();

    const item = cart.find(item =>
        sameProductId(item.productId, productId) &&
        String(item.size ?? "") === String(size ?? "")
    );

    if (!item) {
        console.warn("⚠️ Cart item not found:", productId);
        return false;
    }

    // Quantity 0 means remove
    if (quantity <= 0) {

        const updatedCart = cart.filter(cartItem =>
            !(
                sameProductId(cartItem.productId, productId) &&
                String(cartItem.size ?? "") === String(size ?? "")
            )
        );

        saveCart(updatedCart);

    } else {

        item.quantity = Math.floor(quantity);

        saveCart(cart);
    }

    updateCartCount();
    renderCart();

    return true;
}


// ======================================================
// CLEAR ENTIRE CART
// ======================================================

function clearCart() {

    const cart = loadCart();

    if (cart.length === 0) {
        updateCartCount();
        renderCart();
        return true;
    }

    const confirmed = confirm(
        "Are you sure you want to remove all shoes from your cart?"
    );

    if (!confirmed) {
        return false;
    }

    localStorage.removeItem(PN_CART_KEY);

    // Keep PNStore compatible
    if (typeof PNStore !== "undefined" && PNStore) {
        PNStore.cart = [];
    }

    updateCartCount();
    renderCart();

    console.log("🗑️ Cart cleared");

    return true;
}


// ======================================================
// CART ITEM COUNT
// ======================================================

function getCartItemCount() {

    const cart = loadCart();

    return cart.reduce((total, item) => {

        const quantity = Number(item.quantity) || 0;

        return total + quantity;

    }, 0);
}


// ======================================================
// CART TOTAL
// ======================================================

function getCartTotal() {

    const cart = loadCart();

    return cart.reduce((total, item) => {

        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;

        return total + (price * quantity);

    }, 0);
}


// ======================================================
// UPDATE CART BADGE
// ======================================================

function updateCartCount() {

    const cartCount = document.getElementById("cartCount");

    if (!cartCount) {
        return;
    }

    const count = getCartItemCount();

    cartCount.textContent = count;

    // Hide badge when cart is empty
    if (count <= 0) {

        cartCount.style.display = "none";

    } else {

        cartCount.style.display = "inline-flex";
    }
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// ESCAPE VALUE FOR ONCLICK
// ======================================================

function escapeJSString(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n");
}


// ======================================================
// RENDER CART
// ======================================================

function renderCart() {

    const cartContainer =
        document.getElementById("cartItems");

    const emptyCart =
        document.getElementById("emptyCart");

    const cartTotal =
        document.getElementById("cartTotal");

    const checkoutButton =
        document.getElementById("checkoutButton");

    const cart = loadCart();

    // --------------------------------------------------
    // If cart container doesn't exist
    // --------------------------------------------------

    if (!cartContainer) {
        updateCartCount();
        return;
    }

    // --------------------------------------------------
    // Empty cart
    // --------------------------------------------------

    if (cart.length === 0) {

        cartContainer.innerHTML = "";

        if (emptyCart) {
            emptyCart.style.display = "block";
        }

        if (cartTotal) {
            cartTotal.textContent = formatPrice(0);
        }

        if (checkoutButton) {
            checkoutButton.disabled = true;
        }

        updateCartCount();

        return;
    }

    // --------------------------------------------------
    // Cart has products
    // --------------------------------------------------

    if (emptyCart) {
        emptyCart.style.display = "none";
    }

    if (checkoutButton) {
        checkoutButton.disabled = false;
    }

    let html = "";

    cart.forEach(item => {

        const productId =
            String(item.productId);

        const name =
            escapeHTML(item.name || "Unknown Shoe");

        const image =
            escapeHTML(item.image || "");

        const size =
            item.size !== null &&
            item.size !== undefined &&
            item.size !== ""
                ? escapeHTML(item.size)
                : "Default";

        const price =
            Number(item.price) || 0;

        const quantity =
            Math.max(1, Number(item.quantity) || 1);

        const subtotal =
            price * quantity;

        // Escape the ID for inline JavaScript
        const safeId =
            escapeJSString(productId);

        const safeSize =
            escapeJSString(
                item.size !== null &&
                item.size !== undefined
                    ? String(item.size)
                    : ""
            );

        html += `

            <div class="cart-item"
                 data-product-id="${escapeHTML(productId)}">

                <div class="cart-item-image">

                    <img
                        src="${image}"
                        alt="${name}"
                        onerror="this.src='images/placeholder.jpg'"
                    >

                </div>


                <div class="cart-item-details">

                    <h3>
                        ${name}
                    </h3>


                    <p class="cart-item-price">
                        ${formatPrice(price)}
                    </p>


                    <p class="cart-item-size">
                        Size: ${size}
                    </p>


                    <div class="cart-item-actions">

                        <button
                            type="button"
                            class="quantity-btn"
                            onclick="decreaseCartQuantity('${safeId}', '${safeSize}')"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>


                        <span class="cart-quantity">
                            ${quantity}
                        </span>


                        <button
                            type="button"
                            class="quantity-btn"
                            onclick="increaseCartQuantity('${safeId}', '${safeSize}')"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>

                    </div>

                </div>


                <div class="cart-item-right">

                    <strong class="cart-item-subtotal">
                        ${formatPrice(subtotal)}
                    </strong>


                    <button
                        type="button"
                        class="remove-cart-item"
                        onclick="removeFromCart('${safeId}', '${safeSize}')"
                    >
                        Remove
                    </button>

                </div>

            </div>

        `;
    });

    cartContainer.innerHTML = html;

    // --------------------------------------------------
    // Update total
    // --------------------------------------------------

    if (cartTotal) {
        cartTotal.textContent =
            formatPrice(getCartTotal());
    }

    updateCartCount();
}


// ======================================================
// FORMAT PRICE
// ======================================================

function formatCartPrice(price) {

    const amount = Number(price) || 0;

    return new Intl.NumberFormat("en-RW").format(amount) + " RWF";
}


//
// Use the existing global formatPrice() from products.js
// if it exists. Otherwise use our backup.
// ======================================================

if (typeof formatPrice !== "function") {

    window.formatPrice = formatCartPrice;
}


// ======================================================
// GET CART
// ======================================================

function getCart() {
    return loadCart();
}


// ======================================================
// EXPORT FUNCTIONS GLOBALLY
// ======================================================

window.loadCart = loadCart;
window.saveCart = saveCart;

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;

window.increaseCartQuantity =
    increaseCartQuantity;

window.decreaseCartQuantity =
    decreaseCartQuantity;

window.updateCartQuantity =
    updateCartQuantity;

window.clearCart = clearCart;

window.getCart = getCart;
window.getCartTotal = getCartTotal;
window.getCartItemCount =
    getCartItemCount;

window.updateCartCount =
    updateCartCount;

window.renderCart =
    renderCart;


// ======================================================
// PAGE STARTUP
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("🛒 PN Shoes Cart System Loaded");

    updateCartCount();

    renderCart();

});