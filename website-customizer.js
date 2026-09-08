/* =========================================================
   MANECLANG WEBSITE CUSTOMIZER
   Home + About text + Hero design

   Draft changes are previewed immediately.
   SAVE persists changes.
   CANCEL restores the last saved version.

   Mobile / responsive improvements:
   - HOME / ABOUT / HERO DESIGN tabs remain accessible
   - Tabs can horizontally scroll on smaller screens
   - Modal automatically focuses active tab into view
========================================================= */

(function () {
    "use strict";

    const STORAGE_KEY = "maneclangWebsiteContent";
    const PROFILE_KEY = "maneclangCurrentProfile";

    // Blank template for newly registered students.
    // MANECLANG's real content is seeded only into the owner account in MySQL.
    const defaults = {
        home: {
            welcome: "", headline: "", subtitle: "", description: "",
            primaryButton: "", secondaryButton: "", labelNumber: "", labelText: ""
        },
        about: {
            welcome: "", headlineTop: "", headlineBottom: "", subtitle: "",
            paragraph1: "", paragraph2: "", paragraph3: "",
            pageNumber: "", pageLabel: "", profileNumber: "", profileLabel: ""
        },
        hero: { design: "sphere" }
    };

    let saved = null;
    let draft = null;
    let modal = null;
    let activeTab = "home";


    /* =====================================================
       HELPERS
    ===================================================== */

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }


    function escapeHTML(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function getProfileId() {
        return localStorage.getItem(PROFILE_KEY) || "maneclang";
    }


    /* =====================================================
       LOAD / SAVE
    ===================================================== */

    function loadAll() {
        let all = {};

        try {
            all = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "{}"
            );
        } catch (_) {
            all = {};
        }

        if (!all || typeof all !== "object") {
            all = {};
        }

        const id = getProfileId();

        const merged = clone(defaults);

        if (all[id]) {
            merged.home = {
                ...merged.home,
                ...(all[id].home || {})
            };

            merged.about = {
                ...merged.about,
                ...(all[id].about || {})
            };

            merged.hero = {
                ...merged.hero,
                ...(all[id].hero || {})
            };
        }

        return {
            all,
            id,
            content: merged
        };
    }


    function saveAll(content) {
        const loaded = loadAll();

        loaded.all[loaded.id] = clone(content);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(loaded.all)
        );
    }


    /* =====================================================
       CONTENT APPLICATION
    ===================================================== */

    function textToHeadline(text) {
        return String(text || "")
            .split(/\r?\n/)
            .map(escapeHTML)
            .join("<br>");
    }


    function setText(id, value, useHTML = false) {
        const el = document.getElementById(id);

        if (!el) return;

        if (useHTML) {
            el.innerHTML = value;
        } else {
            el.textContent = value;
        }
    }


    function setButtonLabel(id, value) {
        const button = document.getElementById(id);

        if (!button) return;

        /*
           Preserve arrow/span inside button.
           Replace only the text content.
        */

        const arrow = button.querySelector("span");

        if (arrow) {
            const textNode = document.createTextNode(
                `${value} `
            );

            button.replaceChildren(textNode, arrow);
        } else {
            button.textContent = value;
        }
    }


    function applyContent(content) {

        /* =========================
           HOME
        ========================= */

        setText(
            "homeWelcome",
            content.home.welcome
        );

        setText(
            "homeHeadline",
            textToHeadline(content.home.headline),
            true
        );

        setText(
            "homeSubtitle",
            content.home.subtitle
        );

        setText(
            "homeDescription",
            content.home.description
        );

        setButtonLabel(
            "homePrimaryButton",
            content.home.primaryButton
        );

        setButtonLabel(
            "homeSecondaryButton",
            content.home.secondaryButton
        );

        setText(
            "heroLabelNumber",
            content.home.labelNumber
        );

        setText(
            "heroLabelText",
            content.home.labelText
        );


        /* =========================
           ABOUT
        ========================= */

        setText(
            "aboutWelcome",
            content.about.welcome
        );

        setText(
            "aboutHeadline",
            `
                ${escapeHTML(content.about.headlineTop)}
                <br>
                <span>
                    ${escapeHTML(content.about.headlineBottom)}
                </span>
            `,
            true
        );

        setText(
            "aboutSubtitle",
            content.about.subtitle
        );

        setText(
            "aboutParagraph1",
            content.about.paragraph1
        );

        setText(
            "aboutParagraph2",
            content.about.paragraph2
        );

        setText(
            "aboutParagraph3",
            content.about.paragraph3
        );

        setText(
            "aboutPageNumber",
            content.about.pageNumber
        );

        setText(
            "aboutPageLabel",
            content.about.pageLabel
        );

        setText(
            "aboutProfileNumber",
            content.about.profileNumber
        );

        setText(
            "aboutProfileLabel",
            content.about.profileLabel
        );


        /* =========================
           HERO DESIGN
        ========================= */

        const visual =
            document.getElementById("heroVisual");

        if (visual) {

            visual.classList.remove(
                "design-sphere",
                "design-hex",
                "design-portal"
            );

            const allowedDesigns = [
                "sphere",
                "hex",
                "portal"
            ];

            const selectedDesign =
                allowedDesigns.includes(
                    content.hero.design
                )
                    ? content.hero.design
                    : "sphere";

            visual.classList.add(
                `design-${selectedDesign}`
            );
        }
    }


    /* =====================================================
       FORM INPUT
    ===================================================== */

    function input(
        name,
        label,
        value,
        multiline = false
    ) {

        const safeValue =
            escapeHTML(value);

        if (multiline) {
            return `
                <label class="mc-field">
                    <span>${label}</span>

                    <textarea
                        data-field="${name}"
                        rows="4"
                    >${safeValue}</textarea>
                </label>
            `;
        }

        return `
            <label class="mc-field">
                <span>${label}</span>

                <input
                    type="text"
                    data-field="${name}"
                    value="${safeValue}"
                >
            </label>
        `;
    }


    /* =====================================================
       MODAL
    ===================================================== */

    function renderModal() {

        if (modal) {
            modal.remove();
        }

        modal = document.createElement("div");

        modal.className =
            "mc-overlay show";

        modal.id =
            "websiteCustomizerModal";


        modal.innerHTML = `

            <div
                class="mc-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mcTitle"
            >

                <!-- HEADER -->

                <div class="mc-head">

                    <div>

                        <p class="welcome">
                            WEBSITE CUSTOMIZER
                        </p>

                        <h2 id="mcTitle">
                            CUSTOMIZE WEBSITE
                        </h2>

                    </div>


                    <button
                        class="mc-close"
                        type="button"
                        data-action="cancel"
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>


                <!-- TABS -->

                <div
                    class="mc-tabs"
                    role="tablist"
                >

                    <button
                        type="button"
                        class="mc-tab active"
                        data-tab="home"
                    >
                        HOME
                    </button>


                    <button
                        type="button"
                        class="mc-tab"
                        data-tab="about"
                    >
                        ABOUT
                    </button>


                    <button type="button" class="mc-tab" data-tab="profile">PROFILE</button>

                    <button
                        type="button"
                        class="mc-tab"
                        data-tab="hero"
                    >
                        HERO DESIGN
                    </button>

                </div>


                <p class="mc-note">

                    Edit your website content.
                    Changes are previewed while you edit
                    and are saved only when you press
                    SAVE CHANGES.

                </p>


                <!-- CONTENT -->

                <div
                    class="mc-body"
                    id="mcBody"
                ></div>


                <!-- FOOTER -->

                <div class="mc-footer">

                    <button
                        type="button"
                        class="mc-cancel"
                        data-action="cancel"
                    >
                        CANCEL
                    </button>


                    <button
                        type="button"
                        class="mc-save"
                        data-action="save"
                    >
                        SAVE CHANGES
                        <span>→</span>
                    </button>

                </div>

            </div>
        `;


        document.body.appendChild(modal);


        renderTab();


        /* =========================
           CLICK EVENTS
        ========================= */

        modal.addEventListener(
            "click",
            function (e) {

                const tab =
                    e.target.closest(
                        "[data-tab]"
                    );


                if (tab) {

                    activeTab =
                        tab.dataset.tab;

                    renderTab();

                    return;
                }


                const action =
                    e.target.closest(
                        "[data-action]"
                    );


                if (action) {

                    if (
                        action.dataset.action ===
                        "save"
                    ) {

                        saveDraft();

                    } else {

                        cancelDraft();

                    }

                    return;
                }


                if (
                    e.target === modal
                ) {

                    cancelDraft();

                }

            }
        );


        /* =========================
           INPUT EVENTS
        ========================= */

        modal.addEventListener(
            "input",
            function (e) {

                const field =
                    e.target.closest(
                        "[data-field]"
                    );

                if (!field) return;


                setDraftField(
                    field.dataset.field,
                    field.value
                );


                applyContent(draft);

            }
        );
    }


    /* =====================================================
       DRAFT FIELD
    ===================================================== */

    function setDraftField(
        field,
        value
    ) {

        if (
            activeTab === "hero"
        ) {
            return;
        }


        const target =
            activeTab === "home"
                ? draft.home
                : draft.about;


        target[field] = value;
    }


    /* =====================================================
       RENDER ACTIVE TAB
    ===================================================== */

    function renderTab() {

        if (!modal) return;


        /* =========================
           UPDATE ACTIVE BUTTON
        ========================= */

        modal
            .querySelectorAll(".mc-tab")
            .forEach(function (btn) {

                const isActive =
                    btn.dataset.tab ===
                    activeTab;

                btn.classList.toggle(
                    "active",
                    isActive
                );

                /*
                   IMPORTANT FOR MOBILE:
                   Make the active tab visible
                   even if the tabs overflow.
                */

                if (
                    isActive &&
                    typeof btn.scrollIntoView ===
                    "function"
                ) {

                    setTimeout(function () {

                        btn.scrollIntoView({
                            behavior: "smooth",
                                block: "nearest",
                                inline: "center"
                            });

                        }, 0);

                    }

            });


        const body =
            modal.querySelector("#mcBody");


        /* =========================
           HOME
        ========================= */

        if (
            activeTab === "home"
        ) {

            body.innerHTML = `

                <div class="mc-section-title">

                    HOME CONTENT

                    <small>01</small>

                </div>


                <div class="mc-grid">

                    ${input(
                        "welcome",
                        "WELCOME LABEL",
                        draft.home.welcome
                    )}


                    ${input(
                        "headline",
                        "MAIN HEADLINE · one line per row",
                        draft.home.headline,
                        true
                    )}


                    ${input(
                        "subtitle",
                        "SUBTITLE",
                        draft.home.subtitle
                    )}


                    ${input(
                        "description",
                        "DESCRIPTION",
                        draft.home.description,
                        true
                    )}


                    ${input(
                        "primaryButton",
                        "PRIMARY BUTTON",
                        draft.home.primaryButton
                    )}


                    ${input(
                        "secondaryButton",
                        "SECONDARY BUTTON",
                        draft.home.secondaryButton
                    )}


                    ${input(
                        "labelNumber",
                        "HERO NUMBER",
                        draft.home.labelNumber
                    )}


                    ${input(
                        "labelText",
                        "HERO SMALL LABEL",
                        draft.home.labelText
                    )}

                </div>

            `;

            return;
        }


        /* =========================
           ABOUT
        ========================= */

        if (
            activeTab === "about"
        ) {

            body.innerHTML = `

                <div class="mc-section-title">

                    ABOUT CONTENT

                    <small>02</small>

                </div>


                <div class="mc-grid">

                    ${input(
                        "welcome",
                        "SECTION LABEL",
                        draft.about.welcome
                    )}


                    ${input(
                        "headlineTop",
                        "HEADLINE TOP",
                        draft.about.headlineTop
                    )}


                    ${input(
                        "headlineBottom",
                        "HEADLINE BOTTOM",
                        draft.about.headlineBottom
                    )}


                    ${input(
                        "subtitle",
                        "SUBTITLE",
                        draft.about.subtitle
                    )}


                    ${input(
                        "paragraph1",
                        "PARAGRAPH 01",
                        draft.about.paragraph1,
                        true
                    )}


                    ${input(
                        "paragraph2",
                        "PARAGRAPH 02",
                        draft.about.paragraph2,
                        true
                    )}


                    ${input(
                        "paragraph3",
                        "PARAGRAPH 03",
                        draft.about.paragraph3,
                        true
                    )}


                    ${input(
                        "pageNumber",
                        "PAGE NUMBER",
                        draft.about.pageNumber
                    )}


                    ${input(
                        "pageLabel",
                        "PAGE LABEL",
                        draft.about.pageLabel
                    )}


                    ${input(
                        "profileNumber",
                        "PROFILE NUMBER",
                        draft.about.profileNumber
                    )}


                    ${input(
                        "profileLabel",
                        "PROFILE LABEL",
                        draft.about.profileLabel
                    )}

                </div>

            `;

            return;
        }


        /* =========================
           HERO DESIGN
        ========================= */

        body.innerHTML = `

            <div class="mc-section-title">

                HERO DESIGN

                <small>04</small>

            </div>


            <p class="mc-design-help">

                The pencil icon beside the homepage
                hero opens this same design area.

                Pick a visual identity,
                then SAVE CHANGES.

            </p>


            <div class="mc-design-grid">

                ${designCard(
                    "sphere",
                    "METALLIC SPHERE",
                    "Classic / minimal",
                    "preview-sphere"
                )}


                ${designCard(
                    "hex",
                    "HEX CORE",
                    "Technical / geometric",
                    "preview-hex"
                )}


                ${designCard(
                    "portal",
                    "ORBIT PORTAL",
                    "Futuristic / digital",
                    "preview-portal"
                )}

            </div>
        `;


        body
            .querySelectorAll(
                "[data-design]"
            )
            .forEach(function (btn) {

                btn.addEventListener(
                    "click",
                    function () {

                        draft.hero.design =
                            btn.dataset.design;


                        applyContent(
                            draft
                        );


                        renderTab();

                    }
                );

            });
    }


    /* =====================================================
       HERO DESIGN CARD
    ===================================================== */

    function designCard(
        id,
        title,
        sub,
        previewClass
    ) {

        const selected =
            draft.hero.design === id
                ? " selected"
                : "";


        return `

            <button
                type="button"
                class="mc-design-card${selected}"
                data-design="${id}"
            >

                <span
                    class="
                        mc-design-preview
                        ${previewClass}
                    "
                >
                    <span>M</span>
                </span>


                <span>

                    <strong>
                        ${title}
                    </strong>

                    <small>
                        ${sub}
                    </small>

                </span>


                <i class="bi bi-check2"></i>

            </button>

        `;
    }


    /* =====================================================
       OPEN
    ===================================================== */

    function openCustomizer(
        initialTab = "home"
    ) {

        const loaded =
            loadAll();


        saved =
            clone(
                loaded.content
            );


        draft =
            clone(
                saved
            );


        activeTab =
            initialTab;


        renderModal();


        applyContent(
            draft
        );


        document.body.classList.add(
            "mc-open"
        );
    }


    /* =====================================================
       SAVE
    ===================================================== */

    function saveDraft() {
        if (activeTab === "profile") {
            try {
                const profiles = JSON.parse(localStorage.getItem("maneclangWebsiteProfiles") || "[]");
                const id = getProfileId();
                const current = profiles.find(p => p && p.id === id);
                const name = document.querySelector('[data-field="profileName"]')?.value.trim() || "";
                const description = document.querySelector('[data-field="profileDescription"]')?.value.trim() || "";
                if (current) { current.name = name; current.description = description; localStorage.setItem("maneclangWebsiteProfiles", JSON.stringify(profiles)); }
            } catch (_) {}
        }
        saveAll(draft);


        saved =
            clone(
                draft
            );


        applyContent(
            saved
        );


        closeModal();
    }


    /* =====================================================
       CANCEL
    ===================================================== */

    function cancelDraft() {

        if (saved) {

            applyContent(
                saved
            );

        }


        closeModal();
    }


    /* =====================================================
       CLOSE
    ===================================================== */

    function closeModal() {

        if (modal) {

            modal.remove();

        }


        modal = null;


        document.body.classList.remove(
            "mc-open"
        );
    }


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function init() {

        const loaded =
            loadAll();


        applyContent(
            loaded.content
        );


        /*
           PROFILE MENU
           CUSTOMIZE WEBSITE
        */

        window.addEventListener(
            "maneclang:customize-website",
            function () {

                openCustomizer(
                    "home"
                );

            }
        );


        /*
           HERO PENCIL BUTTON
        */

        const heroButton =
            document.getElementById(
                "heroCustomizeButton"
            );


        if (heroButton) {

            heroButton.addEventListener(
                "click",
                function (e) {

                    e.preventDefault();

                    e.stopPropagation();


                    openCustomizer(
                        "hero"
                    );

                }
            );

        }


        /*
           ESC KEY
        */

        document.addEventListener(
            "keydown",
            function (e) {

                if (
                    e.key === "Escape" &&
                    modal
                ) {

                    cancelDraft();

                }

            }
        );
    }


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }

})();