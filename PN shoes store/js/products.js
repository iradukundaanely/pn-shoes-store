/* =========================================================
   PN SHOES STORE
   PRODUCT DATABASE
   js/products.js

   FEATURES:
   - Original PN products
   - Admin-added products
   - Search admin products
   - Category filtering
   - Featured products
   - Newest products
   - Product ID lookup
   - Works with uploaded Base64 images
========================================================= */

"use strict";


// =========================================================
// ORIGINAL PN SHOES
// =========================================================

const products = [

    {
        id: "PN001",
        name: "PN Air Street",
        category: "Sneakers",
        gender: "Men",
        price: 45000,
        oldPrice: 55000,
        image: "images/shoes/pn-air-street.jpg",
        description: "Modern everyday sneakers with a comfortable lightweight design.",
        sizes: [38, 39, 40, 41, 42, 43, 44],
        rating: 4.8,
        reviews: 124,
        stock: 15,
        featured: true,
        newest: true
    },

    {
        id: "PN002",
        name: "PN Urban Runner",
        category: "Sneakers",
        gender: "Men",
        price: 52000,
        oldPrice: 62000,
        image: "images/shoes/pn-urban-runner.jpg",
        description: "Street-inspired sneakers designed for everyday comfort.",
        sizes: [39, 40, 41, 42, 43, 44],
        rating: 4.7,
        reviews: 98,
        stock: 12,
        featured: true,
        newest: false
    },

    {
        id: "PN003",
        name: "PN Classic White",
        category: "Sneakers",
        gender: "Unisex",
        price: 40000,
        oldPrice: 48000,
        image: "images/shoes/pn-classic-white.jpg",
        description: "Clean classic sneakers that match almost any outfit.",
        sizes: [36, 37, 38, 39, 40, 41, 42, 43],
        rating: 4.6,
        reviews: 76,
        stock: 20,
        featured: true,
        newest: false
    },

    {
        id: "PN004",
        name: "PN Street Black",
        category: "Sneakers",
        gender: "Unisex",
        price: 47000,
        oldPrice: 54000,
        image: "images/shoes/pn-street-black.jpg",
        description: "Minimal black sneakers for everyday street style.",
        sizes: [37, 38, 39, 40, 41, 42, 43, 44],
        rating: 4.7,
        reviews: 82,
        stock: 17,
        featured: false,
        newest: true
    },

    {
        id: "PN005",
        name: "PN Speed Runner",
        category: "Running",
        gender: "Men",
        price: 65000,
        oldPrice: 75000,
        image: "images/shoes/pn-speed-runner.jpg",
        description: "Lightweight running shoes designed for comfortable movement.",
        sizes: [39, 40, 41, 42, 43, 44],
        rating: 4.9,
        reviews: 156,
        stock: 10,
        featured: true,
        newest: true
    },

    {
        id: "PN006",
        name: "PN Motion Pro",
        category: "Running",
        gender: "Women",
        price: 62000,
        oldPrice: 70000,
        image: "images/shoes/pn-motion-pro.jpg",
        description: "Comfort-focused running shoes for training and daily runs.",
        sizes: [36, 37, 38, 39, 40, 41],
        rating: 4.8,
        reviews: 113,
        stock: 14,
        featured: true,
        newest: false
    },

    {
        id: "PN007",
        name: "PN Flex Runner",
        category: "Running",
        gender: "Unisex",
        price: 58000,
        oldPrice: 68000,
        image: "images/shoes/pn-flex-runner.jpg",
        description: "Flexible running shoes built for comfortable daily movement.",
        sizes: [37, 38, 39, 40, 41, 42, 43],
        rating: 4.6,
        reviews: 89,
        stock: 16,
        featured: false,
        newest: true
    },

    {
        id: "PN008",
        name: "PN Sport Max",
        category: "Sports",
        gender: "Men",
        price: 70000,
        oldPrice: 82000,
        image: "images/shoes/pn-sport-max.jpg",
        description: "Versatile sports shoes made for active training.",
        sizes: [39, 40, 41, 42, 43, 44, 45],
        rating: 4.9,
        reviews: 201,
        stock: 9,
        featured: true,
        newest: true
    },

    {
        id: "PN009",
        name: "PN Court Pro",
        category: "Sports",
        gender: "Unisex",
        price: 68000,
        oldPrice: 78000,
        image: "images/shoes/pn-court-pro.jpg",
        description: "Stable sports footwear for court and indoor activities.",
        sizes: [38, 39, 40, 41, 42, 43, 44],
        rating: 4.7,
        reviews: 91,
        stock: 11,
        featured: true,
        newest: false
    },

    {
        id: "PN010",
        name: "PN Active Force",
        category: "Sports",
        gender: "Women",
        price: 63000,
        oldPrice: 73000,
        image: "images/shoes/pn-active-force.jpg",
        description: "Comfortable active shoes for sports and training.",
        sizes: [36, 37, 38, 39, 40, 41],
        rating: 4.8,
        reviews: 104,
        stock: 13,
        featured: false,
        newest: true
    },

    {
        id: "PN011",
        name: "PN Classic Casual",
        category: "Casual",
        gender: "Men",
        price: 42000,
        oldPrice: 50000,
        image: "images/shoes/pn-classic-casual.jpg",
        description: "Simple casual shoes designed for everyday comfort.",
        sizes: [39, 40, 41, 42, 43, 44],
        rating: 4.5,
        reviews: 64,
        stock: 18,
        featured: true,
        newest: false
    },

    {
        id: "PN012",
        name: "PN Daily Comfort",
        category: "Casual",
        gender: "Women",
        price: 44000,
        oldPrice: 52000,
        image: "images/shoes/pn-daily-comfort.jpg",
        description: "Comfortable casual footwear for everyday activities.",
        sizes: [36, 37, 38, 39, 40, 41],
        rating: 4.7,
        reviews: 87,
        stock: 15,
        featured: false,
        newest: true
    },

    {
        id: "PN013",
        name: "PN Easy Walk",
        category: "Casual",
        gender: "Unisex",
        price: 39000,
        oldPrice: 46000,
        image: "images/shoes/pn-easy-walk.jpg",
        description: "Light everyday shoes with a relaxed comfortable fit.",
        sizes: [37, 38, 39, 40, 41, 42, 43],
        rating: 4.6,
        reviews: 72,
        stock: 21,
        featured: false,
        newest: false
    },

    {
        id: "PN014",
        name: "PN Women Street",
        category: "Sneakers",
        gender: "Women",
        price: 48000,
        oldPrice: 58000,
        image: "images/shoes/pn-women-street.jpg",
        description: "Modern women's sneakers with a comfortable everyday design.",
        sizes: [36, 37, 38, 39, 40, 41],
        rating: 4.8,
        reviews: 118,
        stock: 14,
        featured: true,
        newest: true
    },

    {
        id: "PN015",
        name: "PN Women Runner",
        category: "Running",
        gender: "Women",
        price: 60000,
        oldPrice: 70000,
        image: "images/shoes/pn-women-runner.jpg",
        description: "Lightweight women's running shoes for active days.",
        sizes: [36, 37, 38, 39, 40, 41],
        rating: 4.9,
        reviews: 137,
        stock: 12,
        featured: true,
        newest: true
    },

    {
        id: "PN016",
        name: "PN Baby First Step",
        category: "Baby Shoes",
        gender: "Unisex",
        price: 25000,
        oldPrice: 30000,
        image: "images/shoes/pn-baby-first-step.jpg",
        description: "Soft and comfortable shoes designed for little feet.",
        sizes: [20, 21, 22, 23, 24],
        rating: 4.9,
        reviews: 63,
        stock: 20,
        featured: true,
        newest: true
    },

    {
        id: "PN017",
        name: "PN Baby Soft Runner",
        category: "Baby Shoes",
        gender: "Unisex",
        price: 28000,
        oldPrice: 34000,
        image: "images/shoes/pn-baby-soft-runner.jpg",
        description: "Lightweight baby shoes with a soft comfortable design.",
        sizes: [20, 21, 22, 23, 24, 25],
        rating: 4.8,
        reviews: 51,
        stock: 17,
        featured: true,
        newest: false
    },

    {
        id: "PN018",
        name: "PN Baby Classic",
        category: "Baby Shoes",
        gender: "Unisex",
        price: 22000,
        oldPrice: 27000,
        image: "images/shoes/pn-baby-classic.jpg",
        description: "Simple comfortable footwear for everyday little adventures.",
        sizes: [19, 20, 21, 22, 23, 24],
        rating: 4.7,
        reviews: 44,
        stock: 24,
        featured: false,
        newest: true
    },

    {
        id: "PN019",
        name: "PN Baby Sport",
        category: "Baby Shoes",
        gender: "Unisex",
        price: 30000,
        oldPrice: 36000,
        image: "images/shoes/pn-baby-sport.jpg",
        description: "Sporty baby shoes made for comfortable movement.",
        sizes: [21, 22, 23, 24, 25],
        rating: 4.8,
        reviews: 38,
        stock: 16,
        featured: false,
        newest: true
    },

    {
        id: "PN020",
        name: "PN Baby Walk",
        category: "Baby Shoes",
        gender: "Unisex",
        price: 24000,
        oldPrice: 29000,
        image: "images/shoes/pn-baby-walk.jpg",
        description: "Comfortable everyday shoes for growing little feet.",
        sizes: [20, 21, 22, 23, 24],
        rating: 4.6,
        reviews: 31,
        stock: 19,
        featured: false,
        newest: false
    }

];


// =========================================================
// ADMIN PRODUCT STORAGE
// =========================================================

const ADMIN_PRODUCTS_KEY = "pnShoesAdminProducts";


// =========================================================
// GET PRODUCTS CREATED FROM ADMIN
// =========================================================

function getAdminProducts() {

    try {

        const saved =
            localStorage.getItem(
                ADMIN_PRODUCTS_KEY
            );

        if (!saved) {
            return [];
        }

        const parsed =
            JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(
            product =>
                product &&
                product.id &&
                product.name
        );

    } catch (error) {

        console.error(
            "Could not load admin products:",
            error
        );

        return [];
    }
}


// =========================================================
// GET ALL PRODUCTS
// =========================================================

function getAllProducts() {

    /*
     * Map prevents duplicate IDs.
     *
     * Original products are loaded first.
     * Admin products are then added.
     */

    const productMap =
        new Map();


    // Original products

    products.forEach(product => {

        productMap.set(
            String(product.id),
            product
        );

    });


    // Admin products

    const adminProducts =
        getAdminProducts();


    adminProducts.forEach(product => {

        productMap.set(
            String(product.id),
            product
        );

    });


    return Array.from(
        productMap.values()
    );
}


// =========================================================
// FIND PRODUCT BY ID
// =========================================================

function getProductById(id) {

    if (
        id === undefined ||
        id === null
    ) {
        return null;
    }


    const wantedId =
        String(id);


    return getAllProducts().find(
        product =>
            String(product.id) ===
            wantedId
    ) || null;
}


// =========================================================
// FEATURED PRODUCTS
// =========================================================

function getFeaturedProducts() {

    return getAllProducts().filter(
        product =>
            product.featured === true
    );
}


// =========================================================
// NEWEST PRODUCTS
// =========================================================

function getNewestProducts() {

    return getAllProducts().filter(
        product =>
            product.newest === true
    );
}


// =========================================================
// PRODUCTS BY CATEGORY
// =========================================================

function getProductsByCategory(
    category
) {

    const allProducts =
        getAllProducts();


    if (
        !category ||
        String(category).toLowerCase() ===
        "all"
    ) {
        return allProducts;
    }


    const wantedCategory =
        String(category)
            .trim()
            .toLowerCase();


    return allProducts.filter(
        product =>
            String(product.category || "")
                .trim()
                .toLowerCase() ===
            wantedCategory
    );
}


// =========================================================
// SEARCH PRODUCTS
// =========================================================

function searchProducts(
    searchTerm
) {

    const allProducts =
        getAllProducts();


    if (
        searchTerm === undefined ||
        searchTerm === null ||
        String(searchTerm).trim() === ""
    ) {
        return allProducts;
    }


    const term =
        String(searchTerm)
            .trim()
            .toLowerCase();


    return allProducts.filter(
        product => {

            const name =
                String(
                    product.name || ""
                ).toLowerCase();


            const category =
                String(
                    product.category || ""
                ).toLowerCase();


            const gender =
                String(
                    product.gender || ""
                ).toLowerCase();


            const description =
                String(
                    product.description || ""
                ).toLowerCase();


            const id =
                String(
                    product.id || ""
                ).toLowerCase();


            return (
                name.includes(term) ||
                category.includes(term) ||
                gender.includes(term) ||
                description.includes(term) ||
                id.includes(term)
            );
        }
    );
}


// =========================================================
// FORMAT PRICE
// =========================================================

function formatPrice(price) {

    const number =
        Number(price);


    if (!Number.isFinite(number)) {
        return "0 RWF";
    }


    return (
        new Intl.NumberFormat(
            "en-RW"
        ).format(number) +
        " RWF"
    );
}


// =========================================================
// OPTIONAL HELPER
// =========================================================
// Use this if another page needs to know how many
// products currently exist.

function getProductCount() {

    return getAllProducts().length;
}


// =========================================================
// OPTIONAL HELPER
// =========================================================
// Returns true if the product was created from Admin.

function isAdminProduct(id) {

    const adminProducts =
        getAdminProducts();


    return adminProducts.some(
        product =>
            String(product.id) ===
            String(id)
    );
}


// =========================================================
// MAKE FUNCTIONS AVAILABLE GLOBALLY
// =========================================================

window.products = products;

window.getAdminProducts =
    getAdminProducts;

window.getAllProducts =
    getAllProducts;

window.getProductById =
    getProductById;

window.getFeaturedProducts =
    getFeaturedProducts;

window.getNewestProducts =
    getNewestProducts;

window.getProductsByCategory =
    getProductsByCategory;

window.searchProducts =
    searchProducts;

window.formatPrice =
    formatPrice;

window.getProductCount =
    getProductCount;

window.isAdminProduct =
    isAdminProduct;