/* =========================================================
   STUDENT PORTFOLIO WEBSITE AUTHENTICATION
   PHP + MySQL backed

   OWNER:
   username: matthaevs
   password: matthaevs0203

   New accounts are created EMPTY. They do not inherit
   MANECLANG's profile, projects, achievements, gallery,
   skills, or customizer content.
========================================================= */
"use strict";

const LOGIN_KEY = "maneclangLoggedIn";
const CURRENT_USER_KEY = "maneclangCurrentUser";
const CURRENT_PROFILE_KEY = "maneclangCurrentProfile";
const RECENT_ACCOUNTS_KEY = "portfolioRecentAccounts";

function rememberAccount(account) {
    if (!account || !account.username) return;
    let list = [];
    try { list = JSON.parse(localStorage.getItem(RECENT_ACCOUNTS_KEY) || '[]'); } catch (_) {}
    if (!Array.isArray(list)) list = [];
    const item = { username: account.username, display_name: account.display_name || '', avatar_path: account.avatar_path || '' };
    list = [item, ...list.filter(x => String(x?.username || '').toLowerCase() !== String(item.username).toLowerCase())].slice(0, 8);
    localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(list));
}

function normalizeUsername(username) {
    return String(username || "").trim().toLowerCase();
}

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
    if (button) button.textContent = input.type === "password" ? "SHOW" : "HIDE";
}

async function authRequest(action, payload = {}) {
    const response = await fetch("api/auth.php?action=" + encodeURIComponent(action), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    return data;
}

async function loginAccount(username, password) {
    const result = await authRequest("login", {
        username: normalizeUsername(username),
        password: String(password || "")
    });

    if (result.success) {
        localStorage.setItem(LOGIN_KEY, "true");
        localStorage.setItem(CURRENT_USER_KEY, result.account.username);
        localStorage.setItem('maneclangCurrentDisplayName', result.account.display_name || '');
        if (result.account.avatar_path) localStorage.setItem('maneclangCurrentAvatar', result.account.avatar_path); else localStorage.removeItem('maneclangCurrentAvatar');
        rememberAccount(result.account);
        localStorage.removeItem(CURRENT_PROFILE_KEY);
    }

    return result;
}

async function registerAccount(displayName, username, password, confirmPassword) {
    return await authRequest("register", {
        displayName,
        username: normalizeUsername(username),
        password: String(password || ""),
        confirmPassword: String(confirmPassword || "")
    });
}

async function logoutUser() {
    try {
        await authRequest("logout");
    } catch (_) {}
    localStorage.removeItem(LOGIN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CURRENT_PROFILE_KEY);
    window.location.href = "login.php";
}

function isLoggedIn() {
    return localStorage.getItem(LOGIN_KEY) === "true";
}

function getCurrentUsername() {
    return localStorage.getItem(CURRENT_USER_KEY);
}

function getCurrentUser() {
    const username = getCurrentUsername();
    return username ? { username } : null;
}

function getCurrentWebsiteProfile() {
    const id = localStorage.getItem(CURRENT_PROFILE_KEY);
    if (!id) return null;
    try {
        const profiles = JSON.parse(localStorage.getItem("maneclangWebsiteProfiles") || "[]");
        return Array.isArray(profiles) ? profiles.find(p => p && p.id === id) || null : null;
    } catch (_) { return null; }
}

/* LOGIN */
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const username = document.getElementById("username")?.value || "";
            const password = document.getElementById("password")?.value || "";
            const message = document.getElementById("loginMessage");
            const button = loginForm.querySelector('button[type="submit"]');

            if (message) message.textContent = "";
            if (button) button.disabled = true;

            try {
                const result = await loginAccount(username, password);
                if (!result.success) {
                    if (message) message.textContent = result.message || "LOGIN FAILED.";
                    return;
                }
                window.location.href = "index.html";
            } catch (error) {
                console.error(error);
                if (message) message.textContent = "UNABLE TO CONNECT TO THE SERVER.";
            } finally {
                if (button) button.disabled = false;
            }
        });
    }

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const displayName = document.getElementById("registerName")?.value || "";
            const username = document.getElementById("registerUsername")?.value || "";
            const password = document.getElementById("registerPassword")?.value || "";
            const confirmPassword = document.getElementById("confirmPassword")?.value || "";
            const message = document.getElementById("registerMessage");
            const button = registerForm.querySelector('button[type="submit"]');

            if (message) message.textContent = "";
            if (button) button.disabled = true;

            try {
                const result = await registerAccount(displayName, username, password, confirmPassword);
                if (!result.success) {
                    if (message) message.textContent = result.message || "REGISTRATION FAILED.";
                    return;
                }

                if (message) {
                    message.textContent = "ACCOUNT CREATED. YOU CAN NOW LOG IN.";
                    message.classList.add("success");
                }

                setTimeout(() => { window.location.href = "login.php"; }, 900);
            } catch (error) {
                console.error(error);
                if (message) message.textContent = "UNABLE TO CONNECT TO THE SERVER.";
            } finally {
                if (button) button.disabled = false;
            }
        });
    }
});

window.togglePassword = togglePassword;
window.loginAccount = loginAccount;
window.registerAccount = registerAccount;
window.rememberAccount = rememberAccount;
window.logoutUser = logoutUser;
