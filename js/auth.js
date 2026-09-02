/* =========================================================
   PN SHOES STORE - AUTHENTICATION
   ========================================================= */

"use strict";

const USERS_KEY = "pnShoesUsers";
const CURRENT_USER_KEY = "pnShoesCurrentUser";

function getUsers() {
    try {
        const users =
            JSON.parse(
                localStorage.getItem(USERS_KEY)
            );

        return Array.isArray(users) ? users : [];
    } catch (error) {
        console.error(
            "Could not load users:",
            error
        );

        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );
}

function getCurrentUser() {
    try {
        return JSON.parse(
            localStorage.getItem(
                CURRENT_USER_KEY
            )
        );
    } catch (error) {
        return null;
    }
}

function setCurrentUser(user) {
    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(user)
    );
}

function logout() {
    localStorage.removeItem(
        CURRENT_USER_KEY
    );

    window.location.href = "index.html";
}

function showAuthMessage(message, type = "error") {
    const messageBox =
        document.getElementById("authMessage") ||
        document.getElementById("errorMsg") ||
        document.getElementById("message");

    if (!messageBox) {
        alert(message);
        return;
    }

    messageBox.textContent = message;
    messageBox.className =
        "auth-message " + type;
}

function registerUser(event) {
    if (event) {
        event.preventDefault();
    }

    const name =
        document.getElementById("name")?.value.trim() ||
        document.getElementById("fullName")?.value.trim() ||
        "";

    const email =
        document.getElementById("email")?.value.trim().toLowerCase() ||
        "";

    const password =
        document.getElementById("password")?.value ||
        "";

    const confirmPassword =
        document.getElementById("confirmPassword")?.value ||
        document.getElementById("passwordConfirm")?.value ||
        "";

    if (!name) {
        showAuthMessage(
            "Please enter your name."
        );
        return;
    }

    if (!email) {
        showAuthMessage(
            "Please enter your email."
        );
        return;
    }

    if (!password) {
        showAuthMessage(
            "Please enter a password."
        );
        return;
    }

    if (password.length < 6) {
        showAuthMessage(
            "Password must be at least 6 characters."
        );
        return;
    }

    if (
        confirmPassword &&
        password !== confirmPassword
    ) {
        showAuthMessage(
            "Passwords do not match."
        );
        return;
    }

    const users = getUsers();

    const existingUser =
        users.find(
            user =>
                user.email.toLowerCase() ===
                email
        );

    if (existingUser) {
        showAuthMessage(
            "An account with this email already exists."
        );
        return;
    }

    const user = {
        id:
            "user-" +
            Date.now(),

        name,

        email,

        password,

        createdAt:
            new Date().toISOString()
    };

    users.push(user);

    saveUsers(users);

    showAuthMessage(
        "Account created successfully!",
        "success"
    );

    setTimeout(() => {
        window.location.href =
            "login.html";
    }, 1000);
}

function loginUser(event) {
    if (event) {
        event.preventDefault();
    }

    const email =
        document.getElementById("email")?.value.trim().toLowerCase() ||
        document.getElementById("loginEmail")?.value.trim().toLowerCase() ||
        "";

    const password =
        document.getElementById("password")?.value ||
        document.getElementById("loginPassword")?.value ||
        "";

    if (!email || !password) {
        showAuthMessage(
            "Please enter your email and password."
        );
        return;
    }

    const users = getUsers();

    const user =
        users.find(
            item =>
                item.email.toLowerCase() ===
                    email &&
                item.password === password
        );

    if (!user) {
        showAuthMessage(
            "Incorrect email or password."
        );
        return;
    }

    setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email
    });

    showAuthMessage(
        "Login successful!",
        "success"
    );

    setTimeout(() => {
        window.location.href =
            "account.html";
    }, 700);
}

function protectAccountPage() {
    const user = getCurrentUser();

    if (!user) {
        window.location.href =
            "login.html";
        return;
    }

    const nameElements =
        document.querySelectorAll(
            "#accountName, #userName, #profileName, .user-name"
        );

    nameElements.forEach(element => {
        element.textContent =
            user.name;
    });

    const emailElements =
        document.querySelectorAll(
            "#accountEmail, #userEmail, #profileEmail, .user-email"
        );

    emailElements.forEach(element => {
        element.textContent =
            user.email;
    });
}

function setupLogoutButtons() {
    const buttons =
        document.querySelectorAll(
            "#logoutBtn, .logout-btn, [data-action='logout']"
        );

    buttons.forEach(button => {
        button.addEventListener(
            "click",
            function(event) {
                event.preventDefault();
                logout();
            }
        );
    });
}

function updateNavigationAuth() {
    const user = getCurrentUser();

    const loginLinks =
        document.querySelectorAll(
            ".login-link, [data-auth='login']"
        );

    const accountLinks =
        document.querySelectorAll(
            ".account-link, [data-auth='account']"
        );

    const logoutButtons =
        document.querySelectorAll(
            ".logout-btn, [data-auth='logout']"
        );

    if (user) {
        loginLinks.forEach(
            element =>
                element.style.display = "none"
        );

        accountLinks.forEach(
            element =>
                element.style.display = ""
        );

        logoutButtons.forEach(
            element =>
                element.style.display = ""
        );
    } else {
        accountLinks.forEach(
            element =>
                element.style.display = "none"
        );

        logoutButtons.forEach(
            element =>
                element.style.display = "none"
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    function() {
        const registerForm =
            document.getElementById(
                "registerForm"
            );

        if (registerForm) {
            registerForm.addEventListener(
                "submit",
                registerUser
            );
        }

        const loginForm =
            document.getElementById(
                "loginForm"
            );

        if (loginForm) {
            loginForm.addEventListener(
                "submit",
                loginUser
            );
        }

        setupLogoutButtons();
        updateNavigationAuth();

        if (
            window.location.pathname.endsWith(
                "account.html"
            )
        ) {
            protectAccountPage();
        }

        console.log(
            "PN Shoes authentication loaded successfully."
        );
    }
);