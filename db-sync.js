/* =========================================================
   MYSQL / PHP BRIDGE
   Hydrates the existing website's LocalStorage-compatible
   interface from the logged-in user's MySQL-backed storage.

   The existing UI can therefore keep its current behavior,
   while writes to portfolio data are mirrored to MySQL.
========================================================= */
(function () {
    "use strict";

    const DB_KEYS = new Set([
        "maneclangWebsiteProfiles",
        "maneclangWebsiteContent",
        "maneclangFeaturedProjects",
        "maneclangProjects"
    ]);

    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    let bootstrapping = true;

    function syncWrite(key, value) {
        if (bootstrapping || !DB_KEYS.has(key) && !/^maneclang(ProfileImage|Achievements|Gallery|Skills)_/i.test(key)) return;
        try {
            fetch("api/storage.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ action: "set", key, value })
            }).catch(() => {});
        } catch (_) {}
    }

    function syncRemove(key) {
        if (bootstrapping || !DB_KEYS.has(key) && !/^maneclang(ProfileImage|Achievements|Gallery|Skills)_/i.test(key)) return;
        try {
            fetch("api/storage.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ action: "remove", key })
            }).catch(() => {});
        } catch (_) {}
    }

    Storage.prototype.setItem = function (key, value) {
        originalSetItem.call(this, key, value);
        if (this === window.localStorage) syncWrite(String(key), String(value));
    };

    Storage.prototype.removeItem = function (key) {
        originalRemoveItem.call(this, key);
        if (this === window.localStorage) syncRemove(String(key));
    };

    function request(method, url, body) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, false);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.withCredentials = true;
        xhr.send(body ? JSON.stringify(body) : null);
        if (xhr.status < 200 || xhr.status >= 300) throw new Error("Server request failed");
        return JSON.parse(xhr.responseText || "{}");
    }

    try {
        const result = request("GET", "api/bootstrap.php");
        if (!result.success || !result.user) {
            window.location.href = "login.php";
            return;
        }

        // Clear only the portfolio-owned keys before loading this user's data.
        const existing = [];
        for (let i = 0; i < localStorage.length; i++) existing.push(localStorage.key(i));
        existing.forEach(function (key) {
            if (key && (DB_KEYS.has(key) || /^maneclang(ProfileImage|Achievements|Gallery|Skills)_/i.test(key))) {
                originalRemoveItem.call(localStorage, key);
            }
        });

        Object.keys(result.storage || {}).forEach(function (key) {
            originalSetItem.call(localStorage, key, result.storage[key]);
        });

        originalSetItem.call(localStorage, "maneclangLoggedIn", "true");
        originalSetItem.call(localStorage, "maneclangCurrentUser", result.user.username);
        originalSetItem.call(localStorage, "maneclangCurrentDisplayName", result.user.display_name || "");
        if (result.user.avatar_path) originalSetItem.call(localStorage, "maneclangCurrentAvatar", result.user.avatar_path); else originalRemoveItem.call(localStorage, "maneclangCurrentAvatar");

        const profiles = result.storage.maneclangWebsiteProfiles;
        if (profiles) {
            try {
                const parsed = JSON.parse(profiles);
                if (Array.isArray(parsed) && parsed[0]) originalSetItem.call(localStorage, "maneclangCurrentProfile", parsed[0].id);
            } catch (_) {}
        }

        bootstrapping = false;
    } catch (error) {
        console.error("MySQL bootstrap failed:", error);
        window.location.href = "login.php";
    }
})();
