/* =========================================================
   PN SHOES STORE - MAIN APPLICATION
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL STATE
   ========================================================= */

const PNStore = {
    cart: [],
    products: [],
    filteredProducts: [],
    currentUser: null,

    currentCategory: "All",
    currentSearch: "",
    currentSort: "default"
};


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeStore();
});


function initializeStore() {

    loadProducts();
    loadCart();
    loadUser();

    setupNavigation();
    setupSearch();
    setupFilters();
    setupSorting();
    setupGlobalEvents();

    renderProducts();
    renderCart();
    renderProductDetails();

    updateCartCount();
    updateUserUI();
}


/* =========================================================
   PRODUCTS
   ========================================================= */

function loadProducts() {

    try {

        /*
         * products.js now provides getAllProducts().
         * This combines the original products with
         * products uploaded from the Admin Dashboard.
         */

        if (
            typeof getAllProducts === "function"
        ) {

            PNStore.products = getAllProducts();

        } else {

            console.error(
                "getAllProducts() was not found. Make sure products.js loads before app.js."
            );

            PNStore.products = [];

        }

    } catch (error) {

        console.error(
            "Could not load products:",
            error
        );

        PNStore.products = [];
    }

    PNStore.filteredProducts = [
        ...PNStore.products
    ];
}


/*
 * Refresh products from products.js.
 *
 * Useful when an Admin product has been added
 * and the shop needs to immediately see it.
 */

function refreshProducts() {

    try {

        if (
            typeof getAllProducts === "function"
        ) {

            PNStore.products = getAllProducts();

        } else {

            PNStore.products = [];

        }

    } catch (error) {

        console.error(
            "Could not refresh products:",
            error
        );

        PNStore.products = [];
    }

    applyProductFilters();
}


/* =========================================================
   PRODUCT FINDER
   ========================================================= */

function findProduct(productId) {

    return PNStore.products.find(product => {

        return String(product.id) === String(productId);

    });
}


/* =========================================================
   CURRENCY
   ========================================================= */

function formatPrice(price) {

    return `${Number(price || 0).toLocaleString()} RWF`;

}


/* =========================================================
   PRODUCT FILTERING
   ========================================================= */

function applyProductFilters() {

    let result = [
        ...PNStore.products
    ];


    /* -----------------------------------------------------
       CATEGORY
       ----------------------------------------------------- */

    if (
        PNStore.currentCategory &&
        PNStore.currentCategory.toLowerCase() !== "all"
    ) {

        result = result.filter(product => {

            return String(product.category || "")
                .toLowerCase()
                ===
                PNStore.currentCategory.toLowerCase();

        });

    }


    /* -----------------------------------------------------
       SEARCH
       ----------------------------------------------------- */

    const search = PNStore.currentSearch
        .trim()
        .toLowerCase();


    if (search) {

        result = result.filter(product => {

            const name =
                String(product.name || "")
                    .toLowerCase();

            const category =
                String(product.category || "")
                    .toLowerCase();

            const gender =
                String(product.gender || "")
                    .toLowerCase();

            const description =
                String(product.description || "")
                    .toLowerCase();

            return (
                name.includes(search) ||
                category.includes(search) ||
                gender.includes(search) ||
                description.includes(search)
            );

        });

    }


    /* -----------------------------------------------------
       SORTING
       ----------------------------------------------------- */

    switch (PNStore.currentSort) {

        case "price-low":

            result.sort(
                (a, b) =>
                    Number(a.price || 0) -
                    Number(b.price || 0)
            );

            break;


        case "price-high":

            result.sort(
                (a, b) =>
                    Number(b.price || 0) -
                    Number(a.price || 0)
            );

            break;


        case "name":

            result.sort(
                (a, b) =>
                    String(a.name || "")
                        .localeCompare(
                            String(b.name || "")
                        )
            );

            break;


        case "newest":

            result.sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.createdAt || 0
                        ).getTime();

                    const dateB =
                        new Date(
                            b.createdAt || 0
                        ).getTime();

                    return dateB - dateA;
                }
            );

            break;


        case "default":

        default:

            /*
             * Featured products first.
             */

            result.sort(
                (a, b) => {

                    if (
                        Boolean(a.featured) !==
                        Boolean(b.featured)
                    ) {

                        return Boolean(b.featured) -
                            Boolean(a.featured);

                    }

                    return 0;
                }
            );

            break;
    }


    PNStore.filteredProducts = result;

    renderProducts(result);

    updateResultsCount(result.length);
}


/* =========================================================
   PRODUCT RENDERING
   ========================================================= */

function renderProducts(
    products = PNStore.filteredProducts
) {

    const containers =
        document.querySelectorAll(
            "#productsGrid, .products-grid, .product-grid"
        );


    if (!containers.length) {
        return;
    }


    containers.forEach(container => {

        if (!products || !products.length) {

            container.innerHTML = "";

            const emptyState =
                document.querySelector("#emptyState");

            if (emptyState) {

                emptyState.style.display = "block";

            }

            return;
        }


        const emptyState =
            document.querySelector("#emptyState");

        if (emptyState) {

            emptyState.style.display = "none";

        }


        container.innerHTML = products
            .map(product => createProductCard(product))
            .join("");

    });


    updateResultsCount(products.length);
}


/* =========================================================
   PRODUCT CARD
   ========================================================= */

function createProductCard(product) {

    const rating = Math.max(
        0,
        Math.min(
            5,
            Number(product.rating || 0)
        )
    );


    const stars =
        "★".repeat(rating) +
        "☆".repeat(5 - rating);


    /*
     * Admin products use data URLs.
     * Normal products use normal image paths.
     */

    const image =
        product.image ||
        "images/shoes/default.jpg";


    /*
     * Badge
     */

    let badge = "";

    if (product.badge) {

        badge = product.badge;

    } else if (product.featured) {

        badge = "FEATURED";

    } else if (product.newest) {

        badge = "NEW";

    }


    return `
        <article
            class="product-card"
            data-product-id="${escapeHTML(product.id)}"
        >

            <div class="product-image">

                ${
                    badge
                        ? `
                            <span class="product-badge">
                                ${escapeHTML(badge)}
                            </span>
                          `
                        : ""
                }

                <a
                    href="product.html?id=${encodeURIComponent(product.id)}"
                >

                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(product.name || "PN Shoes")}"
                        loading="lazy"
                        onerror="this.onerror=null;this.src='images/shoes/default.jpg';"
                    >

                </a>

            </div>


            <div class="product-info">

                <div class="product-category">

                    ${escapeHTML(
                        product.category || "Shoes"
                    )}

                </div>


                <a
                    href="product.html?id=${encodeURIComponent(product.id)}"
                >

                    <h3 class="product-title">

                        ${escapeHTML(
                            product.name || "PN Shoes"
                        )}

                    </h3>

                </a>


                <div class="product-rating">

                    ${stars}

                </div>


                <div class="product-price">

                    ${formatPrice(product.price)}

                    ${
                        product.oldPrice
                            ? `
                                <span class="product-old-price">
                                    ${formatPrice(
                                        product.oldPrice
                                    )}
                                </span>
                              `
                            : ""
                    }

                </div>


                <div class="product-actions">

                    <button
                        class="btn btn-primary add-to-cart"
                        data-id="${escapeHTML(product.id)}"
                        type="button"
                    >

                        Add to Cart

                    </button>


                    <a
                        class="btn btn-outline"
                        href="product.html?id=${encodeURIComponent(product.id)}"
                    >

                        View

                    </a>

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   RESULTS COUNT
   ========================================================= */

function updateResultsCount(count) {

    const element =
        document.querySelector("#resultsCount");


    if (!element) {
        return;
    }


    const total =
        PNStore.products.length;


    element.textContent =
        `Showing ${count} of ${total} products`;
}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

    const searchInputs =
        document.querySelectorAll(
            "#searchInput, .search-box input, [data-search]"
        );


    searchInputs.forEach(input => {

        input.addEventListener(
            "input",
            () => {

                PNStore.currentSearch =
                    input.value;

                applyProductFilters();

            }
        );

    });


    const searchButton =
        document.querySelector("#searchButton");


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            () => {

                const input =
                    document.querySelector(
                        "#searchInput"
                    );

                if (input) {

                    PNStore.currentSearch =
                        input.value;

                }

                applyProductFilters();

            }
        );

    }

}


/* =========================================================
   CATEGORY FILTERS
   ========================================================= */

function setupFilters() {

    const filterButtons =
        document.querySelectorAll(
            ".filter-btn[data-category]"
        );


    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const category =
                    button.dataset.category ||
                    "All";


                PNStore.currentCategory =
                    category;


                filterButtons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );


                applyProductFilters();

            }
        );

    });


    /*
     * Support:
     * shop.html?category=Running
     */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const urlCategory =
        params.get("category");


    if (urlCategory) {

        PNStore.currentCategory =
            urlCategory;


        filterButtons.forEach(button => {

            if (
                String(
                    button.dataset.category
                ).toLowerCase()
                ===
                String(urlCategory).toLowerCase()
            ) {

                filterButtons.forEach(btn =>
                    btn.classList.remove("active")
                );

                button.classList.add("active");

            }

        });

    }

}


/* =========================================================
   SORTING
   ========================================================= */

function setupSorting() {

    const sortSelect =
        document.querySelector("#sortSelect");


    if (!sortSelect) {
        return;
    }


    sortSelect.addEventListener(
        "change",
        () => {

            PNStore.currentSort =
                sortSelect.value;

            applyProductFilters();

        }
    );

}


/* =========================================================
   CLEAR FILTERS
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const clearButton =
            event.target.closest(
                "#clearFilters"
            );


        if (!clearButton) {
            return;
        }


        PNStore.currentCategory =
            "All";

        PNStore.currentSearch =
            "";

        PNStore.currentSort =
            "default";


        const searchInput =
            document.querySelector(
                "#searchInput"
            );

        if (searchInput) {

            searchInput.value = "";

        }


        const sortSelect =
            document.querySelector(
                "#sortSelect"
            );

        if (sortSelect) {

            sortSelect.value =
                "default";

        }


        document.querySelectorAll(
            ".filter-btn"
        ).forEach(button => {

            button.classList.remove(
                "active"
            );

            if (
                String(
                    button.dataset.category
                ).toLowerCase()
                === "all"
            ) {

                button.classList.add(
                    "active"
                );

            }

        });


        applyProductFilters();

    }
);


/* =========================================================
   CART
   ========================================================= */

function loadCart() {

    try {

        const savedCart =
            localStorage.getItem(
                "pn_cart"
            );


        PNStore.cart =
            savedCart
                ? JSON.parse(savedCart)
                : [];


        if (
            !Array.isArray(
                PNStore.cart
            )
        ) {

            PNStore.cart = [];

        }

    } catch (error) {

        console.error(
            "Could not load cart:",
            error
        );

        PNStore.cart = [];

    }

}


function saveCart() {

    localStorage.setItem(
        "pn_cart",
        JSON.stringify(
            PNStore.cart
        )
    );

    updateCartCount();

}


function addToCart(
    productId,
    quantity = 1,
    size = null
) {

    const product =
        findProduct(productId);


    if (!product) {

        showToast(
            "Product not found.",
            "error"
        );

        return;

    }


    const existingItem =
        PNStore.cart.find(item => {

            return (
                String(item.productId) ===
                String(productId) &&

                String(item.size || "") ===
                String(size || "")
            );

        });


    if (existingItem) {

        existingItem.quantity +=
            Number(quantity);

    } else {

        PNStore.cart.push({

            productId:
                product.id,

            name:
                product.name,

            price:
                Number(product.price || 0),

            image:
                product.image,

            size:
                size,

            quantity:
                Number(quantity)

        });

    }


    saveCart();


    showToast(
        `${product.name} added to your cart.`,
        "success"
    );

}


/* =========================================================
   REMOVE CART ITEM
   ========================================================= */

function removeFromCart(
    productId,
    size = null
) {

    PNStore.cart =
        PNStore.cart.filter(item => {

            return !(
                String(item.productId) ===
                String(productId) &&

                String(item.size || "") ===
                String(size || "")
            );

        });


    saveCart();

    renderCart();

}


/* =========================================================
   CHANGE CART QUANTITY
   ========================================================= */

function changeQuantity(
    productId,
    change,
    size = null
) {

    const item =
        PNStore.cart.find(item => {

            return (
                String(item.productId) ===
                String(productId) &&

                String(item.size || "") ===
                String(size || "")
            );

        });


    if (!item) {
        return;
    }


    item.quantity +=
        Number(change);


    if (item.quantity <= 0) {

        removeFromCart(
            productId,
            size
        );

        return;

    }


    saveCart();

    renderCart();

}


/* =========================================================
   CART COUNT
   ========================================================= */

function getCartCount() {

    return PNStore.cart.reduce(
        (total, item) => {

            return total +
                Number(
                    item.quantity || 0
                );

        },
        0
    );

}


function getCartTotal() {

    return PNStore.cart.reduce(
        (total, item) => {

            return total +
                (
                    Number(
                        item.price || 0
                    ) *
                    Number(
                        item.quantity || 0
                    )
                );

        },
        0
    );

}


function updateCartCount() {

    const count =
        getCartCount();


    document.querySelectorAll(
        ".cart-count, #cartCount"
    ).forEach(element => {

        element.textContent =
            count;


        element.style.display =
            count > 0
                ? "grid"
                : "none";

    });

}


/* =========================================================
   CART PAGE
   ========================================================= */

function renderCart() {

    const container =
        document.querySelector(
            "#cartItems, .cart-items"
        );


    if (!container) {
        return;
    }


    if (!PNStore.cart.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🛒
                </div>

                <h2>
                    Your cart is empty
                </h2>

                <p>
                    Find your next favorite pair
                    at PN Shoes Store.
                </p>

                <br>

                <a
                    href="shop.html"
                    class="btn btn-primary"
                >
                    Shop Shoes
                </a>

            </div>

        `;


        updateCartSummary();

        return;

    }


    container.innerHTML =
        PNStore.cart
            .map(item => {

                return `

                    <div class="cart-item">

                        <img
                            class="cart-item-image"
                            src="${escapeHTML(
                                item.image ||
                                "images/shoes/default.jpg"
                            )}"
                            alt="${escapeHTML(
                                item.name
                            )}"
                            onerror="this.onerror=null;this.src='images/shoes/default.jpg';"
                        >


                        <div>

                            <h3>
                                ${escapeHTML(
                                    item.name
                                )}
                            </h3>


                            ${
                                item.size
                                    ? `
                                        <p>
                                            Size:
                                            ${escapeHTML(
                                                String(
                                                    item.size
                                                )
                                            )}
                                        </p>
                                      `
                                    : ""
                            }


                            <p>
                                ${formatPrice(
                                    item.price
                                )}
                            </p>


                            <div class="quantity">

                                <button
                                    type="button"
                                    onclick="changeQuantity(
                                        '${escapeHTML(
                                            String(
                                                item.productId
                                            )
                                        )}',
                                        -1,
                                        '${escapeHTML(
                                            String(
                                                item.size || ""
                                            )
                                        )}'
                                    "
                                >
                                    −
                                </button>


                                <strong>
                                    ${item.quantity}
                                </strong>


                                <button
                                    type="button"
                                    onclick="changeQuantity(
                                        '${escapeHTML(
                                            String(
                                                item.productId
                                            )
                                        )}',
                                        1,
                                        '${escapeHTML(
                                            String(
                                                item.size || ""
                                            )
                                        )}'
                                    "
                                >
                                    +
                                </button>

                            </div>

                        </div>


                        <div>

                            <strong>
                                ${formatPrice(
                                    Number(item.price || 0) *
                                    Number(item.quantity || 0)
                                )}
                            </strong>


                            <br>


                            <button
                                class="btn btn-danger"
                                type="button"
                                onclick="removeFromCart(
                                    '${escapeHTML(
                                        String(
                                            item.productId
                                        )
                                    )}',
                                    '${escapeHTML(
                                        String(
                                            item.size || ""
                                        )
                                    )}'
                                "
                            >
                                Remove
                            </button>

                        </div>

                    </div>

                `;

            })
            .join("");


    updateCartSummary();

}


/* =========================================================
   CART SUMMARY
   ========================================================= */

function updateCartSummary() {

    const subtotal =
        getCartTotal();


    document.querySelectorAll(
        "#cartSubtotal, .cart-subtotal"
    ).forEach(element => {

        element.textContent =
            formatPrice(subtotal);

    });


    document.querySelectorAll(
        "#cartTotal, .cart-total"
    ).forEach(element => {

        element.textContent =
            formatPrice(subtotal);

    });

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const menuToggle =
        document.querySelector(
            ".menu-toggle, #menuToggle"
        );


    const navLinks =
        document.querySelector(
            ".nav-links"
        );


    if (
        menuToggle &&
        navLinks
    ) {

        menuToggle.addEventListener(
            "click",
            () => {

                navLinks.classList.toggle(
                    "open"
                );


                document.body.classList.toggle(
                    "no-scroll",
                    navLinks.classList.contains(
                        "open"
                    )
                );

            }
        );


        navLinks
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        navLinks.classList.remove(
                            "open"
                        );

                        document.body.classList.remove(
                            "no-scroll"
                        );

                    }
                );

            });

    }

}


/* =========================================================
   USER
   ========================================================= */

function loadUser() {

    try {

        const savedUser =
            localStorage.getItem(
                "pn_current_user"
            );


        PNStore.currentUser =
            savedUser
                ? JSON.parse(savedUser)
                : null;

    } catch {

        PNStore.currentUser =
            null;

    }

}


function saveUser(user) {

    PNStore.currentUser =
        user;


    localStorage.setItem(
        "pn_current_user",
        JSON.stringify(user)
    );


    updateUserUI();

}


function logoutUser() {

    localStorage.removeItem(
        "pn_current_user"
    );


    PNStore.currentUser =
        null;


    updateUserUI();


    showToast(
        "You have been logged out.",
        "success"
    );

}


function updateUserUI() {

    document.querySelectorAll(
        "[data-user-name], #userName"
    ).forEach(element => {

        element.textContent =
            PNStore.currentUser?.name ||
            "Guest";

    });

}


/* =========================================================
   GLOBAL EVENTS
   ========================================================= */

function setupGlobalEvents() {

    document.addEventListener(
        "click",
        event => {

            const addButton =
                event.target.closest(
                    ".add-to-cart"
                );


            if (addButton) {

                const id =
                    addButton.dataset.id;


                addToCart(id);

            }

        }
    );


    const logoutButtons =
        document.querySelectorAll(
            "#logoutBtn, [data-logout]"
        );


    logoutButtons.forEach(button => {

        button.addEventListener(
            "click",
            logoutUser
        );

    });

}


/* =========================================================
   PRODUCT DETAILS
   ========================================================= */

function getProductFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get("id");

}


function renderProductDetails() {

    const productId =
        getProductFromURL();


    if (!productId) {
        return;
    }


    const product =
        findProduct(productId);


    if (!product) {

        console.warn(
            "Product not found:",
            productId
        );

        return;

    }


    const image =
        document.querySelector(
            "#productImage, .product-detail-image img"
        );


    const title =
        document.querySelector(
            "#productTitle, .product-detail-info h1"
        );


    const price =
        document.querySelector(
            "#productPrice, .detail-price"
        );


    const description =
        document.querySelector(
            "#productDescription, .product-description"
        );


    if (image) {

        image.src =
            product.image ||
            "images/shoes/default.jpg";

        image.alt =
            product.name;

    }


    if (title) {

        title.textContent =
            product.name;

    }


    if (price) {

        price.textContent =
            formatPrice(
                product.price
            );

    }


    if (description) {

        description.textContent =
            product.description ||
            "";

    }

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message,
    type = "success"
) {

    let container =
        document.querySelector(
            ".toast-container"
        );


    if (!container) {

        container =
            document.createElement(
                "div"
            );

        container.className =
            "toast-container";

        document.body.appendChild(
            container
        );

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    toast.textContent =
        message;


    container.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateX(30px)";


            setTimeout(
                () => {

                    toast.remove();

                },
                300
            );

        },
        3000
    );

}


/* =========================================================
   HTML SAFETY
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   GLOBAL ACCESS
   ========================================================= */

window.PNStore =
    PNStore;

window.addToCart =
    addToCart;

window.removeFromCart =
    removeFromCart;

window.changeQuantity =
    changeQuantity;

window.renderCart =
    renderCart;

window.renderProducts =
    renderProducts;

window.refreshProducts =
    refreshProducts;

window.formatPrice =
    formatPrice;

window.showToast =
    showToast;

window.saveUser =
    saveUser;

window.logoutUser =
    logoutUser;

window.findProduct =
    findProduct;