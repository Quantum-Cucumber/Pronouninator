const PRESETS = {
    he: {
        subjective: "he",
        objective: "him",
        possessive: "his",
        possessivePlural: "his",
        reflexive: "himself",
        singular: true,
    },
    she: {
        subjective: "she",
        objective: "her",
        possessive: "her",
        possessivePlural: "hers",
        reflexive: "herself",
        singular: true,
    },
    they: {
        subjective: "they",
        objective: "them",
        possessive: "their",
        possessivePlural: "theirs",
        reflexive: "themself",
        singular: false,
    },
    xe: {
        subjective: "xe",
        objective: "xem",
        possessive: "xyr",
        possessivePlural: "xyrs",
        reflexive: "xemself",
        singular: true,
    },
    it: {
        subjective: "it",
        objective: "it",
        possessive: "its",
        possessivePlural: "its",
        reflexive: "itself",
        singular: true,
    },
}

const PRONOUNFIELDS = ["subjective", "objective", "possessive", "possessivePlural", "reflexive"]


function selectPreset(presetString) {
    /* Fills the form fields based on the preset string */

    if (presetString === "custom") {
        document.getElementById("custom").style.display = "block";
    }
    else {
        document.getElementById("custom").style.display = "none";
    }

    if (!(presetString in PRESETS)) {
        // TODO: Make the fields blank instead
        return;
    }

    const preset = PRESETS[presetString];
    
    for (const field of PRONOUNFIELDS) {
        document.getElementById(field).value = preset[field];
    }

    if (preset.singular) {
        document.getElementById("singular").checked = true;
    }
    else {
        document.getElementById("plural").checked = true;
    }
}

function onLoad() {
    /* Fill the pronoun fields from the url params */

    // Get the url params
    const params = new URLSearchParams(window.location.search);

    // If a preset is specified, use that
    if (params.has("preset")) {
        const preset = params.get("preset");
        document.getElementById("presets").value = preset;
        selectPreset(preset);

        return;
    }

    // Fill in the form fields based on the params
    document.getElementById("presets").value = "custom";
    document.getElementById("custom").style.display = "block";

    for (const field of PRONOUNFIELDS) {
        document.getElementById(field).value = params.get(field);
    }

    document.getElementById("singular").checked = params.get("singular") === "true";
    document.getElementById("plural").checked = params.get("singular") === "false";
}

function getUrl() {
    /* Builds the sharable url */

    const baseUrl = window.location.href.split("?")[0];
    const params = [];

    // If a preset is selected, directly use that
    const presetDropdown = document.getElementById("presets");
    if (presetDropdown.value !== "select" && presetDropdown.value !== "custom") {
        return baseUrl + "?preset=" + presetDropdown.value;
    }

    // Get each form field's value and add to the query params if a value is set
    for (const field of PRONOUNFIELDS) {
        const value = document.getElementById(field).value;
        if (value) {
            params.push(field + "=" + value);
        }
    }

    // Determine if the pronouns are singular or plural and add to params
    if (document.getElementById("singular").checked) {
        params.push("singular=true");
    }
    else if (document.getElementById("plural").checked) {
        params.push("singular=false");
    }

    return baseUrl + "?" + params.join("&");
}

function copyUrl() {
    /* Copy the url to the clipboard and set the current url */

    const url = getUrl();
    navigator.clipboard.writeText(url);
    window.history.pushState({}, "", url);
    alert("Copied sharable url");
}
