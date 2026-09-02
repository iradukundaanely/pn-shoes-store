"use strict";

// ============================================================
// PN SHOES STORE - ADMIN DASHBOARD
// ============================================================

const ADMIN_STORAGE_KEY = "pnShoesAdminProducts";

let editingProductId = null;
let selectedImageData = "";
let imageProcessing = false;


// ============================================================
// HELPER
// ============================================================

function $(id) {
    return document.getElementById(id);
}


// ============================================================
// STORAGE
// ============================================================

function getProducts() {
    try {
        const saved = localStorage.getItem(ADMIN_STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const products = JSON.parse(saved);

        return Array.isArray(products) ? products : [];
    } catch (error) {
        console.error("Could not load admin products:", error);
        return [];
    }
}


function saveProducts(products) {
    try {
        /*
         * The old version stored the same product data in two
         * localStorage keys. That is especially bad when images
         * are included because images can be large.
         *
         * We now use ONE storage location.
         */

        localStorage.setItem(
            ADMIN_STORAGE_KEY,
            JSON.stringify(products)
        );

        return true;

    } catch (error) {
        console.error("Could not save products:", error);

        if (
            error.name === "QuotaExceededError" ||
            error.code === 22 ||
            error.code === 1014
        ) {
            showMessage(
                "Storage is full. Try using a smaller image or delete some old products.",
                "error"
            );
        } else {
            showMessage(
                "Could not save the product.",
                "error"
            );
        }

        return false;
    }
}


// ============================================================
// PRODUCT ID
// ============================================================

function generateProductId() {
    return (
        "PN-" +
        Date.now() +
        "-" +
        Math.random().toString(36).substring(2, 8)
    );
}


// ============================================================
// PRICE
// ============================================================

function formatAdminPrice(price) {
    const number = Number(price);

    if (Number.isNaN(number)) {
        return "0 RWF";
    }

    return (
        new Intl.NumberFormat("en-RW").format(number) +
        " RWF"
    );
}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(message, type = "success") {

    let box = $("adminMessage");

    if (!box) {
        box = document.createElement("div");

        box.id = "adminMessage";

        box.style.position = "fixed";
        box.style.top = "20px";
        box.style.right = "20px";
        box.style.zIndex = "99999";
        box.style.padding = "14px 20px";
        box.style.borderRadius = "10px";
        box.style.fontWeight = "600";
        box.style.maxWidth = "350px";
        box.style.boxShadow = "0 5px 20px rgba(0,0,0,.2)";

        document.body.appendChild(box);
    }

    box.textContent = message;

    if (type === "error") {
        box.style.background = "#ffdddd";
        box.style.color = "#b00000";
    } else {
        box.style.background = "#ddffdf";
        box.style.color = "#087a14";
    }

    clearTimeout(box._timer);

    box._timer = setTimeout(() => {
        box.remove();
    }, 4000);
}


// ============================================================
// IMAGE READER
// ============================================================

function readFileAsDataURL(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = event => {
            resolve(event.target.result);
        };

        reader.onerror = () => {
            reject(new Error("Could not read image."));
        };

        reader.readAsDataURL(file);
    });
}


// ============================================================
// LOAD IMAGE
// ============================================================

function loadImage(dataURL) {

    return new Promise((resolve, reject) => {

        const image = new Image();

        image.onload = () => resolve(image);

        image.onerror = () => {
            reject(new Error("Could not load image."));
        };

        image.src = dataURL;
    });
}


// ============================================================
// COMPRESS IMAGE
// ============================================================

async function compressImage(file) {

    const originalData = await readFileAsDataURL(file);

    const image = await loadImage(originalData);

    let maxDimension = 1200;
    let quality = 0.82;

    let finalData = "";

    for (let attempt = 0; attempt < 10; attempt++) {

        let width = image.naturalWidth;
        let height = image.naturalHeight;

        const largestSide = Math.max(width, height);

        if (largestSide > maxDimension) {

            const scale =
                maxDimension / largestSide;

            width = Math.round(width * scale);
            height = Math.round(height * scale);
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("Canvas is not supported.");
        }

        /*
         * White background prevents transparent PNG images
         * from becoming black when converted to JPEG.
         */

        context.fillStyle = "#ffffff";

        context.fillRect(
            0,
            0,
            width,
            height
        );

        context.drawImage(
            image,
            0,
            0,
            width,
            height
        );

        finalData = canvas.toDataURL(
            "image/jpeg",
            quality
        );

        /*
         * Keep the stored image reasonably small.
         */

        if (finalData.length <= 700000) {
            return finalData;
        }

        if (quality > 0.50) {

            quality -= 0.08;

        } else {

            maxDimension =
                Math.round(maxDimension * 0.80);

            quality = 0.72;
        }
    }

    return finalData;
}


// ============================================================
// IMAGE PREVIEW
// ============================================================

function setupImagePreview() {

    const imageInput = $("productImage");
    const imagePreview = $("imagePreview");
    const previewImage = $("previewImage");
    const saveButton = $("saveProductBtn");

    if (!imageInput) {
        return;
    }

    imageInput.addEventListener("change", async function () {

        const file = this.files && this.files[0];

        if (!file) {
            return;
        }

        // Check file type

        if (!file.type.startsWith("image/")) {

            showMessage(
                "Please select an image file.",
                "error"
            );

            this.value = "";
            return;
        }

        /*
         * Allow reasonably large original images.
         * We compress them before storing them.
         */

        const MAX_FILE_SIZE = 10 * 1024 * 1024;

        if (file.size > MAX_FILE_SIZE) {

            showMessage(
                "Image is too large. Please choose an image under 10 MB.",
                "error"
            );

            this.value = "";
            return;
        }

        try {

            imageProcessing = true;

            if (saveButton) {
                saveButton.disabled = true;
                saveButton.textContent =
                    "Processing Photo...";
            }

            showMessage(
                "Processing your shoe photo..."
            );

            selectedImageData =
                await compressImage(file);

            if (previewImage) {
                previewImage.src =
                    selectedImageData;
            }

            if (imagePreview) {
                imagePreview.style.display =
                    "block";
            }

            showMessage(
                "Photo uploaded and ready!"
            );

        } catch (error) {

            console.error(error);

            selectedImageData = "";

            showMessage(
                "Could not process this image.",
                "error"
            );

        } finally {

            imageProcessing = false;

            updateSaveButton();
        }
    });
}


// ============================================================
// SAVE BUTTON STATE
// ============================================================

function updateSaveButton() {

    const saveButton = $("saveProductBtn");

    if (!saveButton) {
        return;
    }

    if (imageProcessing) {

        saveButton.disabled = true;
        saveButton.textContent =
            "Processing Photo...";

        return;
    }

    saveButton.disabled = false;

    saveButton.textContent =
        editingProductId
            ? "Update Product"
            : "Add Product";
}


// ============================================================
// GET SELECTED SIZES
// ============================================================

function getSelectedSizes() {

    const checkboxes =
        document.querySelectorAll(
            'input[name="sizes"]:checked'
        );

    return Array.from(checkboxes).map(
        checkbox => checkbox.value
    );
}


// ============================================================
// RESET IMAGE
// ============================================================

function resetImage() {

    selectedImageData = "";

    const imageInput =
        $("productImage");

    const imagePreview =
        $("imagePreview");

    const previewImage =
        $("previewImage");

    if (imageInput) {
        imageInput.value = "";
    }

    if (previewImage) {
        previewImage.removeAttribute("src");
    }

    if (imagePreview) {
        imagePreview.style.display = "none";
    }
}


// ============================================================
// RESET FORM
// ============================================================

function resetProductForm() {

    const form = $("productForm");

    if (form) {
        form.reset();
    }

    editingProductId = null;

    imageProcessing = false;

    resetImage();

    const saveButton =
        $("saveProductBtn");

    if (saveButton) {
        saveButton.textContent =
            "Add Product";

        saveButton.disabled = false;
    }

    const cancelButton =
        $("cancelEditBtn");

    if (cancelButton) {
        cancelButton.style.display =
            "none";
    }

    updateSaveButton();
}


// ============================================================
// CREATE PRODUCT OBJECT
// ============================================================

function createProductFromForm(existingProduct = null) {

    const productName =
        $("productName");

    const productPrice =
        $("productPrice");

    const productOldPrice =
        $("productOldPrice");

    const productCategory =
        $("productCategory");

    const productGender =
        $("productGender");

    const productStock =
        $("productStock");

    const productRating =
        $("productRating");

    const productReviews =
        $("productReviews");

    const productDescription =
        $("productDescription");

    const productFeatured =
        $("productFeatured");

    const productNewest =
        $("productNewest");


    return {

        id:
            existingProduct?.id ||
            generateProductId(),

        name:
            productName?.value.trim() ||
            "",

        price:
            Number(productPrice?.value) || 0,

        oldPrice:
            Number(productOldPrice?.value) || 0,

        category:
            productCategory?.value ||
            "",

        gender:
            productGender?.value ||
            "",

        stock:
            Number(productStock?.value) || 0,

        rating:
            Number(productRating?.value) || 5,

        reviews:
            Number(productReviews?.value) || 0,

        image:
            selectedImageData ||
            existingProduct?.image ||
            "",

        sizes:
            getSelectedSizes(),

        description:
            productDescription?.value.trim() ||
            "",

        featured:
            Boolean(productFeatured?.checked),

        newest:
            Boolean(productNewest?.checked),

        createdAt:
            existingProduct?.createdAt ||
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()
    };
}


// ============================================================
// VALIDATE PRODUCT
// ============================================================

function validateProduct(product) {

    if (!product.name) {

        showMessage(
            "Please enter the product name.",
            "error"
        );

        return false;
    }

    if (
        !Number.isFinite(product.price) ||
        product.price <= 0
    ) {

        showMessage(
            "Please enter a valid price.",
            "error"
        );

        return false;
    }

    if (!product.category) {

        showMessage(
            "Please select a category.",
            "error"
        );

        return false;
    }

    if (!product.gender) {

        showMessage(
            "Please select the gender.",
            "error"
        );

        return false;
    }

    if (
        !Number.isFinite(product.stock) ||
        product.stock < 0
    ) {

        showMessage(
            "Please enter valid stock.",
            "error"
        );

        return false;
    }

    if (
        product.rating < 0 ||
        product.rating > 5
    ) {

        showMessage(
            "Rating must be between 0 and 5.",
            "error"
        );

        return false;
    }

    if (product.reviews < 0) {

        showMessage(
            "Reviews cannot be negative.",
            "error"
        );

        return false;
    }

    if (!product.image) {

        showMessage(
            "Please upload a product image.",
            "error"
        );

        return false;
    }

    return true;
}


// ============================================================
// SUBMIT PRODUCT
// ============================================================

async function handleProductSubmit(event) {

    event.preventDefault();

    if (imageProcessing) {

        showMessage(
            "Please wait while the photo is being processed.",
            "error"
        );

        return;
    }

    const products = getProducts();

    const existingProduct =
        editingProductId
            ? products.find(
                product =>
                    String(product.id) ===
                    String(editingProductId)
            )
            : null;


    const product =
        createProductFromForm(
            existingProduct
        );


    if (!validateProduct(product)) {
        return;
    }


    const oldProducts =
        [...products];


    if (existingProduct) {

        const index =
            products.findIndex(
                item =>
                    String(item.id) ===
                    String(editingProductId)
            );

        if (index !== -1) {
            products[index] = product;
        }

    } else {

        products.push(product);
    }


    const saved =
        saveProducts(products);


    if (!saved) {

        /*
         * Restore previous data in memory.
         */

        products.length = 0;

        oldProducts.forEach(
            item => products.push(item)
        );

        return;
    }


    if (existingProduct) {

        showMessage(
            "Product updated successfully!"
        );

    } else {

        showMessage(
            "Product added successfully! It is now available for the website."
        );
    }


    renderAdminProducts();

    resetProductForm();
}


// ============================================================
// RENDER ADMIN PRODUCTS
// ============================================================

function renderAdminProducts() {

    const list =
        $("adminProductsList");

    const empty =
        $("emptyProducts");

    if (!list) {
        return;
    }

    const products =
        getProducts();


    list.innerHTML = "";


    if (products.length === 0) {

        if (empty) {
            empty.style.display =
                "block";
        }

        return;
    }


    if (empty) {
        empty.style.display =
            "none";
    }


    products.forEach(product => {

        const row =
            document.createElement("tr");


        // IMAGE

        const imageCell =
            document.createElement("td");

        const image =
            document.createElement("img");

        image.src =
            product.image ||
            "images/placeholder.jpg";

        image.alt =
            product.name;

        image.style.width =
            "60px";

        image.style.height =
            "60px";

        image.style.objectFit =
            "cover";

        image.style.borderRadius =
            "8px";

        imageCell.appendChild(image);


        // NAME

        const nameCell =
            document.createElement("td");

        nameCell.textContent =
            product.name;


        // CATEGORY

        const categoryCell =
            document.createElement("td");

        categoryCell.textContent =
            product.category;


        // PRICE

        const priceCell =
            document.createElement("td");

        priceCell.textContent =
            formatAdminPrice(
                product.price
            );


        // STOCK

        const stockCell =
            document.createElement("td");

        stockCell.textContent =
            product.stock;


        // ACTIONS

        const actionCell =
            document.createElement("td");


        const editButton =
            document.createElement("button");

        editButton.type =
            "button";

        editButton.textContent =
            "Edit";

        editButton.className =
            "edit-product-btn";

        editButton.addEventListener(
            "click",
            () => editProduct(product.id)
        );


        const deleteButton =
            document.createElement("button");

        deleteButton.type =
            "button";

        deleteButton.textContent =
            "Delete";

        deleteButton.className =
            "delete-product-btn";

        deleteButton.addEventListener(
            "click",
            () => deleteProduct(product.id)
        );


        actionCell.appendChild(
            editButton
        );

        actionCell.appendChild(
            deleteButton
        );


        row.appendChild(imageCell);
        row.appendChild(nameCell);
        row.appendChild(categoryCell);
        row.appendChild(priceCell);
        row.appendChild(stockCell);
        row.appendChild(actionCell);


        list.appendChild(row);
    });
}


// ============================================================
// EDIT PRODUCT
// ============================================================

function editProduct(id) {

    const products =
        getProducts();

    const product =
        products.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!product) {

        showMessage(
            "Product not found.",
            "error"
        );

        return;
    }


    editingProductId =
        product.id;


    $("productName").value =
        product.name || "";

    $("productPrice").value =
        product.price || "";

    $("productOldPrice").value =
        product.oldPrice || "";

    $("productCategory").value =
        product.category || "";

    $("productGender").value =
        product.gender || "";

    $("productStock").value =
        product.stock ?? "";

    $("productRating").value =
        product.rating ?? 5;

    $("productReviews").value =
        product.reviews ?? 0;

    $("productDescription").value =
        product.description || "";


    if ($("productFeatured")) {
        $("productFeatured").checked =
            Boolean(product.featured);
    }


    if ($("productNewest")) {
        $("productNewest").checked =
            Boolean(product.newest);
    }


    // SELECT SIZES

    const sizeBoxes =
        document.querySelectorAll(
            'input[name="sizes"]'
        );


    sizeBoxes.forEach(box => {

        box.checked =
            Array.isArray(product.sizes) &&
            product.sizes.includes(
                box.value
            );
    });


    // KEEP CURRENT IMAGE

    selectedImageData =
        product.image || "";


    if (
        selectedImageData &&
        $("previewImage")
    ) {

        $("previewImage").src =
            selectedImageData;

        if ($("imagePreview")) {
            $("imagePreview").style.display =
                "block";
        }
    }


    // SHOW CANCEL BUTTON

    if ($("cancelEditBtn")) {

        $("cancelEditBtn").style.display =
            "inline-block";
    }


    updateSaveButton();


    // Scroll to form

    const form =
        $("productForm");

    if (form) {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


// ============================================================
// DELETE PRODUCT
// ============================================================

function deleteProduct(id) {

    const products =
        getProducts();


    const product =
        products.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!product) {
        return;
    }


    const confirmed =
        window.confirm(
            `Delete "${product.name}"?`
        );


    if (!confirmed) {
        return;
    }


    const updated =
        products.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    if (saveProducts(updated)) {

        if (
            String(editingProductId) ===
            String(id)
        ) {
            resetProductForm();
        }

        renderAdminProducts();

        showMessage(
            "Product deleted."
        );
    }
}


// ============================================================
// CLEAR ALL PRODUCTS
// ============================================================

function clearAllProducts() {

    const products =
        getProducts();


    if (products.length === 0) {

        showMessage(
            "There are no added products.",
            "error"
        );

        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to delete ALL products added from the Admin Dashboard?"
        );


    if (!confirmed) {
        return;
    }


    try {

        localStorage.removeItem(
            ADMIN_STORAGE_KEY
        );

        resetProductForm();

        renderAdminProducts();

        showMessage(
            "All admin products have been deleted."
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "Could not clear products.",
            "error"
        );
    }
}


// ============================================================
// CANCEL EDIT
// ============================================================

function cancelEdit() {

    resetProductForm();

    showMessage(
        "Editing cancelled."
    );
}


// ============================================================
// FORM RESET
// ============================================================

function setupFormReset() {

    const form =
        $("productForm");

    if (!form) {
        return;
    }

    form.addEventListener(
        "reset",
        function () {

            /*
             * form.reset() already resets the fields.
             * We only need to clean our JavaScript state.
             */

            setTimeout(() => {

                editingProductId = null;

                imageProcessing = false;

                resetImage();

                const cancelButton =
                    $("cancelEditBtn");

                if (cancelButton) {
                    cancelButton.style.display =
                        "none";
                }

                updateSaveButton();

            }, 0);
        }
    );
}


// ============================================================
// MENU
// ============================================================

function setupMenu() {

    const menuButton =
        $("menuToggle");

    const sidebar =
        $("adminSidebar");

    if (!menuButton || !sidebar) {
        return;
    }

    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "active"
            );
        }
    );
}


// ============================================================
// BUTTONS
// ============================================================

function setupButtons() {

    const clearButton =
        $("clearProductsBtn");

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearAllProducts
        );
    }


    const cancelButton =
        $("cancelEditBtn");

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            cancelEdit
        );
    }
}


// ============================================================
// START ADMIN DASHBOARD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "PN Shoes Store Admin Dashboard loaded."
        );


        const form =
            $("productForm");


        if (form) {

            form.addEventListener(
                "submit",
                handleProductSubmit
            );
        }


        setupImagePreview();

        setupButtons();

        setupFormReset();

        setupMenu();

        renderAdminProducts();

        updateSaveButton();
    }
);