/* =========================================================
   MANECLANG WEBSITE PROFILE SYSTEM
   MULTI PROFILE + REGISTERED ACCOUNT SYSTEM
   LocalStorage Based

   UPDATED:
   - Switching to another registered profile requires password
   - Password verification modal
   - Current profile does not require password
   - MANECLANG protected profile remains accessible
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       STORAGE
    ===================================================== */

    const STORAGE_KEY =
        "maneclangWebsiteProfiles";

    const CURRENT_KEY =
        "maneclangCurrentProfile";

    const ACCOUNTS_KEY =
        "maneclangAccounts";

    const LOGIN_KEY =
        "maneclangLoggedIn";

    const CURRENT_USER_KEY =
        "maneclangCurrentUser";


    /* =====================================================
       DEFAULT MANECLANG PROFILE
       PROTECTED / CANNOT BE DELETED
    ===================================================== */

    const defaultProfile = {

        id: "maneclang",

        name: "MANECLANG",

        description: "Maneclang Website",

        url: "index.html",

        image: "profile.jpg",

        isNew: false,

        setupComplete: true

    };


    /* =====================================================
       SAFE HTML ESCAPE
    ===================================================== */

    function escapeHTML(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       GET ACCOUNTS
    ===================================================== */

    function getAccounts() {
        try {
            const accounts = JSON.parse(localStorage.getItem("portfolioRecentAccounts") || "[]");
            return Array.isArray(accounts) ? accounts : [];
        } catch (_) { return []; }
    }

    /* =====================================================
       SAVE ACCOUNTS
    ===================================================== */

    function saveAccounts(accounts) {

        localStorage.setItem("portfolioRecentAccounts", JSON.stringify(accounts));

    }


    /* =====================================================
       GET PROFILES
    ===================================================== */

    function getProfiles() {

        let profiles = null;

        try {
            profiles = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        } catch (error) {
            profiles = [];
        }

        if (!Array.isArray(profiles)) profiles = [];

        // IMPORTANT: only the owner account has the protected MANECLANG profile.
        // Registered users start with their own empty profile and never receive
        // MANECLANG data automatically.
        const username = String(localStorage.getItem(CURRENT_USER_KEY) || "").toLowerCase();
        const isOwner = username === "matthaevs";

        if (isOwner) {
            const maneclangIndex = profiles.findIndex(p => p && p.id === "maneclang");
            if (maneclangIndex === -1) {
                profiles.unshift({ ...defaultProfile });
            } else {
                profiles[maneclangIndex] = {
                    ...defaultProfile,
                    ...profiles[maneclangIndex],
                    isNew: false,
                    setupComplete: true,
                    protected: true
                };
            }
        }

        let changed = false;
        profiles = profiles.filter(Boolean).map(profile => {
            if (typeof profile.isNew === "undefined") { profile.isNew = false; changed = true; }
            if (typeof profile.setupComplete === "undefined") { profile.setupComplete = true; changed = true; }
            return profile;
        });

        if (changed || (isOwner && !profiles.some(p => p.id === "maneclang"))) saveProfiles(profiles);
        return profiles;
    }


    /* =====================================================
       SAVE PROFILES
    ===================================================== */

    function saveProfiles(profiles) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(profiles)
        );

    }


    /* =====================================================
       CURRENT PROFILE
    ===================================================== */

    function getCurrentProfile() {

        const profiles =
            getProfiles();


        const currentId =
            localStorage.getItem(
                CURRENT_KEY
            );


        let current =
            profiles.find(
                profile =>
                    profile.id === currentId
            );


        if (!current) {

            current = profiles.find(profile => profile && profile.id === "maneclang") || profiles[0];

            if (!current) {
                return null;
            }

            localStorage.setItem(
                CURRENT_KEY,
                current.id
            );

        }


        return current;

    }


    function getActiveId() {

        return localStorage.getItem(
            CURRENT_KEY
        );

    }


    /* =====================================================
       CHECK NEW BLANK PROFILE
    ===================================================== */

    function isBlankWebsiteProfile() {

        const current = getCurrentProfile();
        const savedAvatar = localStorage.getItem("maneclangCurrentAvatar");
        if (current && savedAvatar) current.image = savedAvatar;

        if (!current) {
            return false;
        }


        return (
            current.id !== "maneclang" &&
            current.isNew === true &&
            current.setupComplete !== true
        );

    }


    /* =====================================================
       CREATE PROFILE UI
    ===================================================== */

    function createProfileUI() {

        const navbar =
            document.querySelector(
                ".navbar"
            );


        const profilePlaceholder =
            document.getElementById(
                "profile-placeholder"
            );


        if (!navbar) {
            return;
        }


        /*
           Prevent duplicates.
        */

        if (
            document.getElementById(
                "website-profile-system"
            )
        ) {

            return;

        }


        const current =
            getCurrentProfile();


        const profileSystem =
            document.createElement(
                "div"
            );


        profileSystem.id =
            "website-profile-system";


        profileSystem.innerHTML = `
<!-- =================================================
     DELETE PROFILE MODAL
================================================== -->

<div
    class="profile-modal-overlay"
    id="deleteProfileModalOverlay"
>

    <div
        class="profile-modal small-profile-modal delete-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deleteProfileTitle"
    >

        <button
            class="profile-modal-close"
            id="deleteProfileModalClose"
            type="button"
            aria-label="Close"
        >
            ×
        </button>


        <div class="delete-profile-warning-icon">
            !
        </div>


        <div class="profile-modal-label">
            DANGER ZONE
        </div>


        <h2 id="deleteProfileTitle">
            DELETE PROFILE?
        </h2>


        <p class="profile-modal-text">
            You are about to permanently delete this
            website profile and its connected account.
            This action cannot be undone.
        </p>


        <div
            class="delete-profile-preview"
            id="deleteProfilePreview"
        >

            <div
                class="delete-profile-preview-avatar"
                id="deleteProfilePreviewAvatar"
            >
                +
            </div>


            <div
                class="delete-profile-preview-info"
            >

                <strong
                    id="deleteProfileName"
                >
                    Website Profile
                </strong>

                <span
                    id="deleteProfileDescription"
                >
                    Profile description
                </span>

            </div>

        </div>


        <div class="delete-profile-warning-box">

            <strong>
                This will permanently remove:
            </strong>

            <span>
                • Website profile
            </span>

            <span>
                • Registered account
            </span>

            <span>
                • Account login credentials
            </span>

        </div>


        <div class="delete-profile-actions">

            <button
                type="button"
                class="delete-profile-cancel"
                id="deleteProfileCancel"
            >
                CANCEL
            </button>


            <button
                type="button"
                class="delete-profile-confirm"
                id="deleteProfileConfirm"
            >
                DELETE PROFILE
                <span>→</span>
            </button>

        </div>

    </div>

</div>

            <!-- =================================================
                 PROFILE BUTTON
            ================================================== -->

            <button
                class="website-profile-button"
                id="profileButton"
                type="button"
                aria-label="Website Profile"
                aria-expanded="false"
            >

                <span class="website-profile-avatar">

                    <img
                        id="profileAvatar"
                        src="${escapeHTML(current.image)}"
                        alt="Profile"
                    >

                    <span
                        class="profile-empty-avatar"
                        id="profileEmptyAvatar"
                    >
                        +
                    </span>

                </span>

            </button>


            <!-- =================================================
                 PROFILE MENU
            ================================================== -->

            <div
                class="website-profile-menu"
                id="profileMenu"
            >

                <div class="profile-menu-current">

                    <div class="profile-menu-avatar">

                        <img
                            id="menuProfileAvatar"
                            src="${escapeHTML(current.image)}"
                            alt="Profile"
                        >

                        <span
                            class="profile-menu-empty-avatar"
                            id="menuEmptyAvatar"
                        >
                            +
                        </span>

                    </div>


                    <div class="profile-menu-current-text">

                        <strong id="menuProfileName">
                            ${escapeHTML(
                                current.name ||
                                "New Website"
                            )}
                        </strong>

                        <span id="menuProfileDescription">
                            ${escapeHTML(
                                current.description ||
                                "Website not configured"
                            )}
                        </span>

                    </div>

                </div>


                <div class="profile-menu-divider"></div>


                <button
                    class="profile-menu-item"
                    id="customizeWebsite"
                    type="button"
                >

                    <span class="profile-item-icon">
                        ◇
                    </span>

                    <span>
                        Customize Website
                    </span>

                </button>


                <button
                    class="profile-menu-item"
                    id="themeToggle"
                    type="button"
                >
                    <span class="profile-item-icon">☀</span>
                    <span>LIGHT MODE</span>
                </button>


                <button
                    class="profile-menu-item"
                    id="signOutWebsite"
                    type="button"
                >

                    <span class="profile-item-icon">
                        ↪
                    </span>

                    <span>
                        Log out Profile
                    </span>

                </button>


                <div class="profile-menu-divider"></div>


                <div class="profile-section-title">
                    OTHER WEBSITE PROFILES
                </div>


                <div
                    class="website-profile-list"
                    id="websiteProfileList"
                ></div>


                <button
                    class="profile-manage-button"
                    id="manageWebsiteProfiles"
                    type="button"
                >

                    Manage Website Profiles

                </button>

            </div>


            <!-- =================================================
                 EDIT PROFILE MODAL
            ================================================== -->

            <div
                class="profile-modal-overlay"
                id="profileModalOverlay"
            >

                <div
                    class="profile-modal"
                    role="dialog"
                    aria-modal="true"
                >

                    <button
                        class="profile-modal-close"
                        id="profileModalClose"
                        type="button"
                        aria-label="Close"
                    >
                        ×
                    </button>


                    <div class="profile-modal-label">
                        WEBSITE PROFILE
                    </div>


                    <h2 id="profileModalTitle">
                        Customize Website Profile
                    </h2>


                    <form id="profileForm">

                        <div class="profile-form-image">

                            <div
                                class="profile-preview"
                                id="profilePreview"
                            >

                                <img
                                    src="${escapeHTML(current.image)}"
                                    id="profilePreviewImage"
                                    alt="Preview"
                                >

                                <span
                                    id="profilePreviewEmpty"
                                >
                                    +
                                </span>

                            </div>


                            <label
                                class="profile-upload-button"
                            >

                                CHANGE IMAGE

                                <input
                                    type="file"
                                    id="profileImageInput"
                                    accept="image/*"
                                >

                            </label>

                        </div>


                        <div class="profile-form-group">

                            <label for="profileName">
                                WEBSITE NAME
                            </label>

                            <input
                                id="profileName"
                                type="text"
                                placeholder="Website name"
                                required
                            >

                        </div>


                        <div class="profile-form-group">

                            <label for="profileDescription">
                                DESCRIPTION
                            </label>

                            <input
                                id="profileDescription"
                                type="text"
                                placeholder="Website description"
                                required
                            >

                        </div>


                        <div class="profile-form-group">

                            <label for="profileURL">
                                WEBSITE URL
                            </label>

                            <input
                                id="profileURL"
                                type="text"
                                placeholder="index.html"
                                required
                            >

                        </div>


                        <input
                            type="hidden"
                            id="editingProfileId"
                        >


                        <button
                            class="profile-save-button"
                            type="submit"
                        >

                            SAVE WEBSITE PROFILE

                            <span>
                                →
                            </span>

                        </button>

                    </form>

                </div>

            </div>


            <!-- =================================================
                 MANAGE PROFILES MODAL
            ================================================== -->

            <div
                class="profile-modal-overlay"
                id="manageModalOverlay"
            >

                <div
                    class="profile-modal profile-manage-modal"
                >

                    <button
                        class="profile-modal-close"
                        id="manageModalClose"
                        type="button"
                        aria-label="Close"
                    >
                        ×
                    </button>


                    <div class="profile-modal-label">
                        WEBSITE PROFILES
                    </div>


                    <h2>
                        MANAGE PROFILES
                    </h2>


                    <div
                        class="manage-profile-list"
                        id="manageProfileList"
                    ></div>

                </div>

            </div>


            <!-- =================================================
                 LOG OUT PROFILE MODAL
            ================================================== -->

            <div
                class="profile-modal-overlay"
                id="signOutModalOverlay"
            >

                <div
                    class="profile-modal small-profile-modal"
                >

                    <button
                        class="profile-modal-close"
                        id="signOutModalClose"
                        type="button"
                        aria-label="Close"
                    >
                        ×
                    </button>


                    <div class="profile-modal-label">
                        WEBSITE PROFILE
                    </div>


                    <h2>
                        LOG OUT PROFILE
                    </h2>


                    <p class="profile-modal-text">
                        Choose another website profile to continue.
                    </p>


                    <div
                        class="signout-profile-list"
                        id="signOutProfileList"
                    ></div>

                </div>

            </div>


            <!-- =================================================
                 SWITCH PROFILE PASSWORD MODAL
            ================================================== -->

            <div
                class="profile-modal-overlay"
                id="switchPasswordModalOverlay"
            >

                <div
                    class="profile-modal small-profile-modal password-switch-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="switchPasswordTitle"
                >

                    <button
                        class="profile-modal-close"
                        id="switchPasswordModalClose"
                        type="button"
                        aria-label="Close"
                    >
                        ×
                    </button>


                    <div class="profile-modal-label">
                        ACCOUNT VERIFICATION
                    </div>


                    <h2 id="switchPasswordTitle">
                        VERIFY PASSWORD
                    </h2>


                    <div
                        class="switch-password-profile"
                    >

                        <div
                            class="switch-password-avatar"
                            id="switchPasswordAvatar"
                        >

                            <span>
                                +
                            </span>

                        </div>


                        <div
                            class="switch-password-user"
                        >

                            <strong
                                id="switchPasswordUsername"
                            >
                                USER
                            </strong>

                            <span>
                                Enter your password to switch account.
                            </span>

                        </div>

                    </div>


                    <form
                        id="switchPasswordForm"
                    >

                        <div
                            class="profile-form-group"
                        >

                            <label
                                for="switchPasswordInput"
                            >
                                PASSWORD
                            </label>

                            <div
                                class="password-input-wrapper"
                            >

                                <input
                                    id="switchPasswordInput"
                                    type="password"
                                    placeholder="Enter password"
                                    autocomplete="current-password"
                                    required
                                >

                                <button
                                    type="button"
                                    id="toggleSwitchPassword"
                                    class="password-toggle-button"
                                    aria-label="Show password"
                                >
                                    SHOW
                                </button>

                            </div>

                        </div>


                        <p
                            class="switch-password-error"
                            id="switchPasswordError"
                        ></p>


                        <button
                            class="profile-save-button"
                            type="submit"
                        >

                            CONTINUE

                            <span>
                                →
                            </span>

                        </button>

                    </form>

                </div>

            </div>

        `;


        if (profilePlaceholder) {

            profilePlaceholder.appendChild(
                profileSystem
            );

        } else {

            navbar.appendChild(
                profileSystem
            );

        }


        setupProfileEvents();

        renderProfileList();

        renderManageList();

        renderSignOutProfiles();

        updateCurrentProfileUI();

    }


    /* =====================================================
       RENDER PROFILE LIST
    ===================================================== */

    function renderProfileList() {
        const container = document.getElementById("websiteProfileList");
        if (!container) return;
        const profiles = getProfiles();
        const current = getCurrentProfile();
        const currentUsername = String(localStorage.getItem(CURRENT_USER_KEY) || "").toLowerCase();
        const recent = getAccounts().filter(a => String(a?.username || "").toLowerCase() !== currentUsername);
        const virtual = recent.map(a => ({
            id: "account:" + String(a.username).toLowerCase(),
            name: a.display_name || a.username,
            description: "Registered account",
            image: a.avatar_path || "",
            accountUsername: a.username,
            protected: false,
            isAccountShortcut: true
        }));
        const all = [...profiles, ...virtual];
        container.innerHTML = all.map(profile => {
            const active = current && profile.id === current.id;
            const displayName = profile.name || "Your Portfolio";
            const displayDescription = profile.description || (profile.isAccountShortcut ? "Registered account" : "Not configured");
            return `<button class="website-profile-option ${active ? "selected" : ""}" data-profile-id="${escapeHTML(profile.id)}" type="button">
                <span class="website-profile-option-avatar">${profile.image ? `<img src="${escapeHTML(profile.image)}" alt="">` : `<span class="profile-list-empty">${escapeHTML(displayName.charAt(0).toUpperCase())}</span>`}</span>
                <span class="website-profile-option-text"><strong>${escapeHTML(displayName)}</strong><small>${escapeHTML(displayDescription)}</small></span>
                ${active ? `<span class="profile-check">✓</span>` : `<span class="signout-arrow">→</span>`}
            </button>`;
        }).join("");
        container.querySelectorAll(".website-profile-option").forEach(button => button.addEventListener("click", function(){ switchProfile(this.dataset.profileId); }));
    }

    /* =====================================================
       RENDER MANAGE LIST
    ===================================================== */

    function renderManageList() {

        const container =
            document.getElementById(
                "manageProfileList"
            );


        if (!container) {
            return;
        }


        const profiles =
            getProfiles();


        const current =
            getCurrentProfile();


        container.innerHTML =
            profiles.map(profile => {

                const isDefault =
                    profile.id === "maneclang";


                const active =
                    profile.id === current.id;


                const name =
                    profile.name ||
                    "New Website";


                const description =
                    profile.description ||
                    "Not configured";


                return `

                    <div
                        class="manage-profile-item"
                    >

                        <div
                            class="manage-profile-info"
                        >

                            <div
                                class="manage-profile-avatar"
                            >

                                ${
                                    profile.image
                                    ?
                                    `
                                    <img
                                        src="${escapeHTML(
                                            profile.image
                                        )}"
                                        alt=""
                                    >
                                    `
                                    :
                                    `
                                    <span>
                                        +
                                    </span>
                                    `
                                }

                            </div>


                            <div>

                                <strong>
                                    ${escapeHTML(name)}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        description
                                    )}
                                </span>

                            </div>

                        </div>


                        <div
                            class="manage-profile-actions"
                        >
${
                                !isDefault
                                ?
                                `
                                <button
                                    type="button"
                                    class="manage-delete"
                                    data-delete-id="${escapeHTML(
                                        profile.id
                                    )}"
                                >
                                    DELETE PROFILE
                                </button>
                                `
                                :
                                `
                                <span
                                    class="manage-protected"
                                >
                                    PROTECTED
                                </span>
                                `
                            }


                            ${
                                active
                                ?
                                `
                                <span
                                    class="manage-current"
                                >
                                    CURRENT
                                </span>
                                `
                                :
                                ""
                            }

                        </div>

                    </div>

                `;

            }).join("");
container
            .querySelectorAll(
                ".manage-delete"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        deleteProfile(
                            this.dataset.deleteId
                        );

                    }
                );

            });

    }


    /* =====================================================
       RENDER SIGN OUT LIST
    ===================================================== */

    function renderSignOutProfiles() {

        const container =
            document.getElementById(
                "signOutProfileList"
            );


        if (!container) {
            return;
        }


        const profiles =
            getProfiles();


        const current =
            getCurrentProfile();


        container.innerHTML =
            profiles.map(profile => {

                const isCurrent =
                    profile.id === current.id;


                const name =
                    profile.name ||
                    "New Website";


                const description =
                    profile.description ||
                    "Not configured";


                return `

                    <button
                        class="
                            signout-profile-option
                            ${isCurrent ? "current" : ""}
                        "
                        data-signout-id="${escapeHTML(
                            profile.id
                        )}"
                        type="button"
                    >

                        <span
                            class="signout-avatar"
                        >

                            ${
                                profile.image
                                ?
                                `
                                <img
                                    src="${escapeHTML(
                                        profile.image
                                    )}"
                                    alt=""
                                >
                                `
                                :
                                `
                                <span>
                                    +
                                </span>
                                `
                            }

                        </span>


                        <span
                            class="signout-info"
                        >

                            <strong>
                                ${escapeHTML(name)}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    description
                                )}
                            </small>

                        </span>


                        ${
                            isCurrent
                            ?
                            `
                            <span class="signout-current">
                                CURRENT
                            </span>
                            `
                            :
                            `
                            <span class="signout-arrow">
                                →
                            </span>
                            `
                        }

                    </button>

                `;

            }).join("");


        container
            .querySelectorAll(
                ".signout-profile-option"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            this.dataset.signoutId;


                        if (
                            id === current.id
                        ) {

                            return;

                        }


                        switchProfile(id);

                    }
                );

            });


        /*
           REAL LOGOUT BUTTON
        */

        const logoutButton =
            document.createElement(
                "button"
            );


        logoutButton.type =
            "button";


        logoutButton.className =
            "signout-logout-button";


        logoutButton.innerHTML = `
            <span>
                ↪
            </span>

            <span>
                LOG OUT
            </span>
        `;


        logoutButton.addEventListener(
            "click",
            function () {

                closeAllModals();

                closeProfileMenu();


                try {
                    fetch("api/auth.php?action=logout", {
                        method: "POST",
                        credentials: "same-origin"
                    }).catch(() => {});
                } catch (_) {}

                localStorage.removeItem(CURRENT_KEY);
                localStorage.removeItem(LOGIN_KEY);
                localStorage.removeItem(CURRENT_USER_KEY);
                window.location.href = "login.php";

            }
        );


        container.appendChild(
            logoutButton
        );

    }


    /* =====================================================
       GET ACCOUNT FOR PROFILE
    ===================================================== */

    function getAccountForProfile(profile) {

        if (!profile) {
            return null;
        }


        const username =
            profile.accountUsername ||
            "";


        if (!username) {
            return null;
        }


        const accounts = getAccounts();
        const found = accounts.find(account => account && account.username && account.username.toLowerCase() === username.toLowerCase());
        if (found) return found;
        if (username.toLowerCase() === "matthaevs") return {username:"matthaevs", display_name:"MANECLANG", avatar_path:"profile.jpg"};
        return null;

    }


    /* =====================================================
       OPEN SWITCH PASSWORD MODAL
    ===================================================== */

    function openSwitchPasswordModal(profile) {

        if (!profile) {
            return;
        }


        const account =
            getAccountForProfile(
                profile
            );


        /*
           No registered account connected.
        */

        if (!account) {

            alert(
                "This website profile is not connected to a registered account."
            );

            return;

        }


        const usernameElement =
            document.getElementById(
                "switchPasswordUsername"
            );


        const avatarContainer =
            document.getElementById(
                "switchPasswordAvatar"
            );


        const passwordInput =
            document.getElementById(
                "switchPasswordInput"
            );


        const errorElement =
            document.getElementById(
                "switchPasswordError"
            );


        /*
           Store the profile that is waiting
           for password verification.
        */

        window.maneclangPendingProfileId =
            profile.id;


        if (usernameElement) {

            usernameElement.textContent =
                account.username ||
                profile.name ||
                "USER";

        }


        if (errorElement) {

            errorElement.textContent =
                "";

        }


        if (passwordInput) {

            passwordInput.value =
                "";

        }


        /*
           Avatar
        */

        if (avatarContainer) {

            if (profile.image) {

                avatarContainer.innerHTML = `
                    <img
                        src="${escapeHTML(
                            profile.image
                        )}"
                        alt=""
                    >
                `;

            } else {

                const firstLetter =
                    (
                        account.username ||
                        profile.name ||
                        "U"
                    )
                    .charAt(0)
                    .toUpperCase();


                avatarContainer.innerHTML = `
                    <span>
                        ${escapeHTML(firstLetter)}
                    </span>
                `;

            }

        }


        closeProfileMenu();

        closeModal(
            "signOutModalOverlay"
        );


        openModal(
            "switchPasswordModalOverlay"
        );


        /*
           Focus password input
        */

        setTimeout(
            function () {

                if (passwordInput) {

                    passwordInput.focus();

                }

            },
            100
        );

    }


    /* =====================================================
       VERIFY SWITCH PASSWORD
    ===================================================== */

    async function verifySwitchPassword(event) {

        event.preventDefault();


        const pendingId =
            window.maneclangPendingProfileId;


        if (!pendingId) {
            return;
        }


        const profiles =
            getProfiles();


        const profile =
            profiles.find(
                item =>
                    item.id === pendingId
            );


        if (!profile) {

            closeModal(
                "switchPasswordModalOverlay"
            );

            return;

        }


        const account =
            getAccountForProfile(
                profile
            );


        if (!account) {

            showSwitchPasswordError(
                "This account could not be found."
            );

            return;

        }


        const passwordInput =
            document.getElementById(
                "switchPasswordInput"
            );


        const password =
            passwordInput
                ?
                passwordInput.value
                :
                "";


        if (!password) {

            showSwitchPasswordError(
                "Please enter your password."
            );

            return;

        }


        try {
            const response = await fetch("api/auth.php?action=login", {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                credentials: "same-origin",
                body: JSON.stringify({username: account.username, password})
            });
            const result = await response.json();
            if (!result.success) {
                showSwitchPasswordError("Incorrect password. Please try again.");
                if (passwordInput) { passwordInput.focus(); passwordInput.select(); }
                return;
            }
            localStorage.setItem(CURRENT_USER_KEY, result.account.username);
            localStorage.setItem(LOGIN_KEY, "true");
            localStorage.removeItem(CURRENT_KEY);
            if (result.account.display_name) localStorage.setItem("maneclangCurrentDisplayName", result.account.display_name);
            if (result.account.avatar_path) localStorage.setItem("maneclangCurrentAvatar", result.account.avatar_path); else localStorage.removeItem("maneclangCurrentAvatar");
            if (typeof rememberAccount === "function") rememberAccount(result.account);
            window.maneclangPendingProfileId = null;
            closeModal("switchPasswordModalOverlay");
            closeProfileMenu();
            closeAllModals();
            window.location.href = "index.html";
            return;
        } catch (error) {
            console.error(error);
            showSwitchPasswordError("Unable to verify account right now.");
            return;
        }


        /*
           PASSWORD CORRECT
        */

        localStorage.setItem(
            CURRENT_KEY,
            profile.id
        );


        localStorage.setItem(
            CURRENT_USER_KEY,
            account.username
        );


        localStorage.setItem(
            LOGIN_KEY,
            "true"
        );


        window.maneclangPendingProfileId =
            null;


        closeModal(
            "switchPasswordModalOverlay"
        );


        closeProfileMenu();

        closeAllModals();


        /*
           Navigate to selected profile.
        */

        window.location.href =
            profile.url ||
            "index.html";

    }


    /* =====================================================
       PASSWORD ERROR
    ===================================================== */

    function showSwitchPasswordError(message) {

        const errorElement =
            document.getElementById(
                "switchPasswordError"
            );


        if (errorElement) {

            errorElement.textContent =
                message;

        }

    }


    /* =====================================================
       SWITCH PROFILE
       PASSWORD REQUIRED
    ===================================================== */

    function switchProfile(id) {
        const targetId = String(id || "");
        let profile = getProfiles().find(item => item && item.id === targetId);
        if (!profile && targetId.toLowerCase().startsWith("account:")) {
            const username = targetId.slice(8);
            const account = getAccounts().find(a => String(a?.username || "").toLowerCase() === username.toLowerCase());
            if (account) profile = {id: targetId, name: account.display_name || account.username, description: "Registered account", image: account.avatar_path || "", accountUsername: account.username, isAccountShortcut: true};
        }
        if (!profile) return;
        const currentUsername = String(localStorage.getItem(CURRENT_USER_KEY) || "").toLowerCase();
        const targetUsername = String(profile.accountUsername || (targetId.toLowerCase().startsWith("account:") ? targetId.slice(8) : "")).toLowerCase();
        if (targetUsername && targetUsername === currentUsername) { closeProfileMenu(); return; }
        openSwitchPasswordModal(profile);
    }


    /* =====================================================
       OPEN EDIT PROFILE
    ===================================================== */

    function openEditProfile(id) {

        const profiles =
            getProfiles();


        const profile =
            profiles.find(
                item =>
                    item.id === id
            );


        if (!profile) {
            return;
        }


        closeModal(
            "manageModalOverlay"
        );

        closeModal(
            "signOutModalOverlay"
        );

        closeModal(
            "switchPasswordModalOverlay"
        );

        closeProfileMenu();


        document.getElementById(
            "editingProfileId"
        ).value =
            profile.id;


        document.getElementById(
            "profileName"
        ).value =
            profile.name || "";


        document.getElementById(
            "profileDescription"
        ).value =
            profile.description || "";


        document.getElementById(
            "profileURL"
        ).value =
            profile.url || "index.html";


        document.getElementById(
            "profileModalTitle"
        ).textContent =
            "Customize Website Profile";


        setPreviewImage(
            profile.image || ""
        );


        openModal(
            "profileModalOverlay"
        );

    }


    /* =====================================================
       SET PREVIEW IMAGE
    ===================================================== */

    function setPreviewImage(src) {

        const image =
            document.getElementById(
                "profilePreviewImage"
            );


        const empty =
            document.getElementById(
                "profilePreviewEmpty"
            );


        if (!image || !empty) {
            return;
        }


        if (src) {

            image.src = src;

            image.style.display =
                "block";

            empty.style.display =
                "none";

        } else {

            image.removeAttribute(
                "src"
            );

            image.style.display =
                "none";

            empty.style.display =
                "flex";

        }

    }


    /* =====================================================
       SAVE PROFILE
    ===================================================== */

    function saveProfile(event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "profileName"
            ).value.trim();


        const description =
            document.getElementById(
                "profileDescription"
            ).value.trim();


        const url =
            document.getElementById(
                "profileURL"
            ).value.trim();


        const editingId =
            document.getElementById(
                "editingProfileId"
            ).value;


        if (
            !name ||
            !description ||
            !url
        ) {

            alert(
                "Please complete all profile fields."
            );

            return;

        }


        const profiles =
            getProfiles();


        const previewImage =
            document.getElementById(
                "profilePreviewImage"
            );


        let image = "";


        if (
            previewImage &&
            previewImage.src &&
            previewImage.style.display !== "none"
        ) {

            image =
                previewImage.src;

        }


        if (editingId) {

            const index =
                profiles.findIndex(
                    profile =>
                        profile.id === editingId
                );


            if (index !== -1) {

                const oldProfile =
                    profiles[index];


                profiles[index] = {

                    ...oldProfile,

                    name,

                    description,

                    url,

                    image,

                    isNew: false,

                    setupComplete: true

                };

            }

        }


        saveProfiles(
            profiles
        );


        renderProfileList();

        renderManageList();

        renderSignOutProfiles();

        updateCurrentProfileUI();


        closeModal(
            "profileModalOverlay"
        );


        const activeId =
            getActiveId();


        if (
            editingId &&
            activeId === editingId
        ) {

            window.location.reload();

        }

    }


    /* =====================================================
       IMAGE UPLOAD
    ===================================================== */

    function handleImageUpload(event) {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Please select an image file."
            );

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function () {

                setPreviewImage(
                    reader.result
                );

            };


        reader.readAsDataURL(
            file
        );

    }


    /* =====================================================
       DELETE PROFILE + DELETE ACCOUNT
    ===================================================== */

    function deleteProfile(id) {

        /*
           MANECLANG is protected.
        */

        if (
            id === "maneclang"
        ) {

            alert(
                "The MANECLANG profile cannot be deleted."
            );

            return;

        }


        const profiles =
            getProfiles();


        const profile =
            profiles.find(
                item =>
                    item.id === id
            );


        if (!profile) {
            return;
        }


        const profileName =
            profile.name ||
            "New Website";


        /*
           The website profile stores the
           account username here.
        */

        const accountUsername =
            profile.accountUsername ||
            "";


        /*
           Check whether this profile is
           currently active.
        */

        const isActiveProfile =
            getActiveId() === id;


        /*
           Find the account that belongs
           to this website profile.
        */

        const accounts =
            getAccounts();


        const matchingAccount =
            accountUsername
                ?
                accounts.find(
                    account =>
                        account &&
                        account.username &&
                        account.username.toLowerCase() ===
                        accountUsername.toLowerCase()
                )
                :
                null;


        /*
           Strong confirmation because this
           now deletes BOTH:

           1. Website profile
           2. Registered account
        */

        let confirmationMessage =
            'Are you sure you want to delete "' +
            profileName +
            '"?';


        if (matchingAccount) {

            confirmationMessage +=
                "\n\nThis will permanently delete:" +
                "\n• The website profile" +
                "\n• The registered account" +
                "\n• The account login credentials";

        } else {

            confirmationMessage +=
                "\n\nThe website profile will be permanently deleted.";

        }


        const confirmed =
            confirm(
                confirmationMessage
            );


        if (!confirmed) {
            return;
        }


        /* =================================================
           STEP 1
           DELETE WEBSITE PROFILE
        ================================================== */

        let remainingProfiles =
            profiles.filter(
                item =>
                    item.id !== id
            );


        /*
           Only the owner account keeps the protected MANECLANG profile.
        */

        const deletingUser = String(
            localStorage.getItem(CURRENT_USER_KEY) || ""
        ).toLowerCase();

        if (
            deletingUser === "matthaevs" &&
            !remainingProfiles.some(item => item.id === "maneclang")
        ) {
            remainingProfiles.unshift({ ...defaultProfile });
        }


        saveProfiles(
            remainingProfiles
        );


        /* =================================================
           STEP 2
           DELETE REGISTERED ACCOUNT
        ================================================== */

        if (accountUsername) {

            const remainingAccounts =
                accounts.filter(
                    account => {

                        if (
                            !account ||
                            !account.username
                        ) {

                            return true;

                        }


                        return (
                            account.username.toLowerCase() !==
                            accountUsername.toLowerCase()
                        );

                    }
                );


            saveAccounts(
                remainingAccounts
            );

        }


        /* =================================================
           STEP 3
           REMOVE OLD SESSION DATA
           IF THIS WAS THE ACTIVE ACCOUNT
        ================================================== */

        const currentUser =
            localStorage.getItem(
                CURRENT_USER_KEY
            );


        const activeUserMatches =
            accountUsername &&
            currentUser &&
            currentUser.toLowerCase() ===
            accountUsername.toLowerCase();


        if (
            isActiveProfile ||
            activeUserMatches
        ) {

            localStorage.removeItem(
                LOGIN_KEY
            );


            localStorage.removeItem(
                CURRENT_USER_KEY
            );


            localStorage.setItem(
                CURRENT_KEY,
                "maneclang"
            );


            alert(
                '"' +
                profileName +
                '" and its account have been deleted.'
            );


            window.location.href =
                "login.php";

            return;

        }


        /* =================================================
           STEP 4
           REFRESH UI
        ================================================== */

        renderProfileList();

        renderManageList();

        renderSignOutProfiles();

        updateCurrentProfileUI();


        /* =================================================
           SUCCESS
        ================================================= */

        if (matchingAccount) {

            alert(
                '"' +
                profileName +
                '" and its account have been deleted.'
            );

        } else {

            alert(
                '"' +
                profileName +
                '" has been deleted.'
            );

        }

    }


    /* =====================================================
       UPDATE CURRENT PROFILE UI
    ===================================================== */

    function updateCurrentProfileUI() {

        const current =
            getCurrentProfile();


        if (!current) {
            return;
        }


        const avatar =
            document.getElementById(
                "profileAvatar"
            );


        const menuAvatar =
            document.getElementById(
                "menuProfileAvatar"
            );


        const emptyAvatar =
            document.getElementById(
                "profileEmptyAvatar"
            );


        const menuEmptyAvatar =
            document.getElementById(
                "menuEmptyAvatar"
            );


        const name =
            document.getElementById(
                "menuProfileName"
            );


        const description =
            document.getElementById(
                "menuProfileDescription"
            );


        if (avatar) {

            if (current.image) {

                avatar.src =
                    current.image;

                avatar.style.display =
                    "block";

                if (emptyAvatar) {

                    emptyAvatar.style.display =
                        "none";

                }

            } else {

                avatar.removeAttribute(
                    "src"
                );

                avatar.style.display =
                    "none";

                if (emptyAvatar) {

                    emptyAvatar.style.display =
                        "flex";

                }

            }

        }


        if (menuAvatar) {

            if (current.image) {

                menuAvatar.src =
                    current.image;

                menuAvatar.style.display =
                    "block";

                if (menuEmptyAvatar) {

                    menuEmptyAvatar.style.display =
                        "none";

                }

            } else {

                menuAvatar.removeAttribute(
                    "src"
                );

                menuAvatar.style.display =
                    "none";

                if (menuEmptyAvatar) {

                    menuEmptyAvatar.style.display =
                        "flex";

                }

            }

        }


        const accountName = localStorage.getItem("maneclangCurrentDisplayName") || "";
        if (name) { name.textContent = current.name || accountName || "Your Portfolio"; }
        document.querySelectorAll(".navbar .logo").forEach(el => { el.textContent = current.name || accountName || "PORTFOLIO"; });
        document.querySelectorAll(".footer-brand").forEach(el => { el.textContent = "PORTFOLIO"; });
        document.querySelectorAll(".footer-bottom").forEach(el => {
            el.querySelectorAll("span").forEach(span => { if (/©\s*2026/i.test(span.textContent)) span.textContent = "© 2026 PORTFOLIO"; });
        });


        if (description) {

            description.textContent =
                current.description ||
                "Website not configured";

        }

    }


    /* =====================================================
       PROFILE MENU
    ===================================================== */

    function toggleProfileMenu() {

        const menu =
            document.getElementById(
                "profileMenu"
            );


        const button =
            document.getElementById(
                "profileButton"
            );


        if (!menu) {
            return;
        }


        const isOpen =
            menu.classList.contains(
                "show"
            );


        if (isOpen) {

            closeProfileMenu();

        } else {

            menu.classList.add(
                "show"
            );


            if (button) {

                button.setAttribute(
                    "aria-expanded",
                    "true"
                );

            }

        }

    }


    function closeProfileMenu() {

        const menu =
            document.getElementById(
                "profileMenu"
            );


        const button =
            document.getElementById(
                "profileButton"
            );


        if (menu) {

            menu.classList.remove(
                "show"
            );

        }


        if (button) {

            button.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }


    /* =====================================================
       OPEN MODAL
    ===================================================== */

    function openModal(id) {

        const modal =
            document.getElementById(
                id
            );


        if (!modal) {
            return;
        }


        document
            .querySelectorAll(
                ".profile-modal-overlay.show"
            )
            .forEach(otherModal => {

                if (
                    otherModal.id !== id
                ) {

                    otherModal.classList.remove(
                        "show"
                    );

                }

            });


        modal.classList.add(
            "show"
        );


        document.body.classList.add(
            "profile-modal-open"
        );

    }


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    function closeModal(id) {

        const modal =
            document.getElementById(
                id
            );


        if (!modal) {
            return;
        }


        modal.classList.remove(
            "show"
        );


        if (
            !document.querySelector(
                ".profile-modal-overlay.show"
            )
        ) {

            document.body.classList.remove(
                "profile-modal-open"
            );

        }

    }


    /* =====================================================
       CLOSE ALL MODALS
    ===================================================== */

    function closeAllModals() {

        document
            .querySelectorAll(
                ".profile-modal-overlay.show"
            )
            .forEach(modal => {

                modal.classList.remove(
                    "show"
                );

            });


        document.body.classList.remove(
            "profile-modal-open"
        );


        window.maneclangPendingProfileId =
            null;

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    function openSignOut() {

        closeProfileMenu();


        closeModal(
            "profileModalOverlay"
        );


        closeModal(
            "manageModalOverlay"
        );


        closeModal(
            "switchPasswordModalOverlay"
        );


        renderSignOutProfiles();


        openModal(
            "signOutModalOverlay"
        );

    }


    /* =====================================================
       TOGGLE SWITCH PASSWORD
    ===================================================== */

    function toggleSwitchPassword() {

        const input =
            document.getElementById(
                "switchPasswordInput"
            );


        const button =
            document.getElementById(
                "toggleSwitchPassword"
            );


        if (!input) {
            return;
        }


        if (
            input.type === "password"
        ) {

            input.type =
                "text";


            if (button) {

                button.textContent =
                    "HIDE";

                button.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            }

        } else {

            input.type =
                "password";


            if (button) {

                button.textContent =
                    "SHOW";

                button.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        }

    }


    /* =====================================================
       SETUP EVENTS
    ===================================================== */

    function setupProfileEvents() {

        const profileButton =
            document.getElementById(
                "profileButton"
            );


        if (!profileButton) {
            return;
        }


        /* PROFILE BUTTON */

        profileButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                toggleProfileMenu();

            }
        );


        /* CUSTOMIZE */

        const customizeButton =
            document.getElementById(
                "customizeWebsite"
            );


        if (customizeButton) {

            customizeButton.addEventListener(
                "click",
                function () {

                    closeProfileMenu();

                    window.dispatchEvent(
                        new CustomEvent("maneclang:customize-website")
                    );

                }
            );

        }


        /* LOGOUT */

        const signOutButton =
            document.getElementById(
                "signOutWebsite"
            );


        if (signOutButton) {

            signOutButton.addEventListener(
                "click",
                openSignOut
            );

        }


        /* MANAGE */

        const manageButton =
            document.getElementById(
                "manageWebsiteProfiles"
            );


        if (manageButton) {

            manageButton.addEventListener(
                "click",
                function () {

                    closeProfileMenu();

                    closeModal(
                        "profileModalOverlay"
                    );

                    closeModal(
                        "signOutModalOverlay"
                    );

                    closeModal(
                        "switchPasswordModalOverlay"
                    );

                    renderManageList();

                    openModal(
                        "manageModalOverlay"
                    );

                }
            );

        }


        /* CLOSE PROFILE MODAL */

        const profileModalClose =
            document.getElementById(
                "profileModalClose"
            );


        if (profileModalClose) {

            profileModalClose.addEventListener(
                "click",
                function () {

                    closeModal(
                        "profileModalOverlay"
                    );

                }
            );

        }


        /* CLOSE MANAGE */

        const manageModalClose =
            document.getElementById(
                "manageModalClose"
            );


        if (manageModalClose) {

            manageModalClose.addEventListener(
                "click",
                function () {

                    closeModal(
                        "manageModalOverlay"
                    );

                }
            );

        }


        /* CLOSE SIGN OUT */

        const signOutModalClose =
            document.getElementById(
                "signOutModalClose"
            );


        if (signOutModalClose) {

            signOutModalClose.addEventListener(
                "click",
                function () {

                    closeModal(
                        "signOutModalOverlay"
                    );

                }
            );

        }


        /* CLOSE PASSWORD MODAL */

        const switchPasswordModalClose =
            document.getElementById(
                "switchPasswordModalClose"
            );


        if (switchPasswordModalClose) {

            switchPasswordModalClose.addEventListener(
                "click",
                function () {

                    closeModal(
                        "switchPasswordModalOverlay"
                    );

                    window.maneclangPendingProfileId =
                        null;

                }
            );

        }


        /* SAVE PROFILE */

        const profileForm =
            document.getElementById(
                "profileForm"
            );


        if (profileForm) {

            profileForm.addEventListener(
                "submit",
                saveProfile
            );

        }


        /* PASSWORD SWITCH FORM */

        const switchPasswordForm =
            document.getElementById(
                "switchPasswordForm"
            );


        if (switchPasswordForm) {

            switchPasswordForm.addEventListener(
                "submit",
                verifySwitchPassword
            );

        }


        /* PASSWORD SHOW/HIDE */

        const togglePasswordButton =
            document.getElementById(
                "toggleSwitchPassword"
            );


        if (togglePasswordButton) {

            togglePasswordButton.addEventListener(
                "click",
                toggleSwitchPassword
            );

        }


        /* IMAGE */

        const imageInput =
            document.getElementById(
                "profileImageInput"
            );


        if (imageInput) {

            imageInput.addEventListener(
                "change",
                handleImageUpload
            );

        }


        /* CLICK OUTSIDE MENU */

        document.addEventListener(
            "click",
            function (event) {

                const system =
                    document.getElementById(
                        "website-profile-system"
                    );


                if (
                    system &&
                    !system.contains(
                        event.target
                    )
                ) {

                    closeProfileMenu();

                }

            }
        );


        /* ESCAPE */

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    closeProfileMenu();

                    closeAllModals();

                }

            }
        );


        /* OVERLAY CLICK */

        document
            .querySelectorAll(
                ".profile-modal-overlay"
            )
            .forEach(overlay => {

                overlay.addEventListener(
                    "click",
                    function (event) {

                        if (
                            event.target === this
                        ) {

                            closeModal(
                                this.id
                            );


                            if (
                                this.id ===
                                "switchPasswordModalOverlay"
                            ) {

                                window.maneclangPendingProfileId =
                                    null;

                            }

                        }

                    }
                );

            });

    }


    /* =====================================================
       MAKE NEW PROFILE WEBSITE BLANK
    ===================================================== */

    /* =====================================================
       INITIALIZE
    ===================================================== */

    window.maneclangUpdateProfileUI = updateCurrentProfileUI;

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            syncRegisteredAccountsToProfiles();

            createProfileUI();

            updateCurrentProfileUI();


        }
    );


})();


/* =========================================================
   MYSQL NOTE
   Registered accounts and profiles are created by api/auth.php.
   The old LocalStorage account-to-profile auto-creator has been
   intentionally removed so new users do NOT inherit MANECLANG.
========================================================= */

function syncRegisteredAccountsToProfiles() {
    return;
}
