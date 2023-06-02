const PRONOUNFIELDS = ["subjective", "objective", "possessiveDeterminer", "possessive", "reflexive"];
const VERB_REGEX = /\{([^\{\}]+?)\/([^\{\}]+?)\}/gi;

/*--Generic utility functions--*/

function shuffle(array) {
    /* https://stackoverflow.com/a/46545530 */
    return array
        .map(value => ({value, sort: Math.random()}))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

function getRandomIndex(array) {
    return Math.floor(Math.random() * array.length);
}

function uppercase(text) {
    /* Uppercase the first letter */
    return text.replace(/^[a-z]/, char => char.toUpperCase());
}

function titlecase(text) {
    /* Uppercase the first letter of every word */
    return text.replaceAll(/(^|\s)[a-z]/g, char => char.toUpperCase());
}

function getCustomField(id) {
    return document.getElementById(id).value.trim().toLowerCase();
}


/*--Element contruction--*/

function createOption(key, value) {
    const node = document.createElement("option");
    node.value = key;
    node.textContent = value;
    return node
}

function createExampleCard(sentence, index) {
    const card = document.createElement("div");
    card.className = "card";
    card.style.setProperty("--offset", index + 1);
    card.textContent = sentence;
    return card;
}

function createPracticeField(type) {
    const field = document.createElement("input");
    field.className = "card__field";
    field.title = pronounTypeToString(type);
    field.setAttribute("data-type", type);


    return field;
}

function createPracticeCard(prompt, index) {
    const card = document.createElement("div");
    card.className = "card card--practice";
    card.style.setProperty("--offset", index + 1);

    const form = document.createElement("form");
    form.addEventListener("submit", event => validatePrompt(event, form));
    
    const button = document.createElement("input");
    button.className = "card__check";
    button.type = "submit";
    button.value = "";

    form.appendChild(prompt);
    form.appendChild(button);
    card.appendChild(form);
    return card;
}

function createCorrectReplacement(value) {
    const span = document.createElement("span");
    span.className = "card__answer card__answer--correct";
    span.innerHTML = value;

    return span;
}

function createIncorrectReplacement(value, answer) {
    const span = document.createElement("span");
    span.className = "card__answer";

    const incorrectAnswer = document.createElement("span");
    incorrectAnswer.className="card__answer__incorrect";
    incorrectAnswer.textContent = value;

    const correctAnswer = document.createTextNode(` ${answer}`);

    span.appendChild(incorrectAnswer);
    span.appendChild(correctAnswer);
    return span;
}


/* Dropdowns */

function populatePresets() {
    const presetDropdown = document.getElementById("presets");

    const insertBefore = document.querySelector("#presets>[value=nounself]");

    for (const key in PRESETS) {
        const option = createOption(key, PRESETS[key].name);
        presetDropdown.insertBefore(option, insertBefore);
    }
}

function selectPreset(preset) {
    // Show/hide custom fields
    document.getElementById("custom").style.display = preset === "custom" ? "block" : "none";

    // Show/hide nounself
    document.getElementById("noun-form").style.display = preset === "nounself" ? null : "none"
}

function addCustomPreset(text) {
    const presetDropdown = document.getElementById("presets");

    // Removing existing custom config option
    presetDropdown.querySelectorAll("option[value=customConfig]").forEach(el => el.remove());

    // Create custom dropdown value
    const option = createOption("customConfig", text);
    option.hidden = true;
    presetDropdown.appendChild(option);
    presetDropdown.value = "customConfig";
}

function storeCustom() {
    /* Custom values are collapsed, stored and made visible in the dropdown */
    const title = `${getCustomField("subjective")}/${getCustomField("objective")}/${getCustomField("possessive")}`;
    addCustomPreset(title);

    // Hide fields
    document.getElementById("custom").style.display = "none";

    // Store values
    sessionStorage.clear();

    PRONOUNFIELDS.forEach(field => {
        sessionStorage.setItem(field, getCustomField(field));
    })
    sessionStorage.setItem("pluralVerbs", document.getElementById("plural").checked);
}


/*--Nounself--*/
function nounToCustom() {
    const nounField = document.getElementById("noun");

    // If no value provided, just focus the field
    if (!nounField.value.trim()) {
        nounField.focus();
        return;
    }

    const noun = nounField.value.trim().toLowerCase();

    // Populate fields
    document.getElementById("subjective").value = noun;
    document.getElementById("objective").value = noun;
    document.getElementById("possessiveDeterminer").value = noun;
    document.getElementById("possessive").value = noun + "s";
    document.getElementById("reflexive").value = noun + "self";
    document.getElementById("singular").checked = true;
    
    // Show everything needed for the custom view
    document.getElementById("presets").value = "custom";
    document.getElementById("custom").style.display = "block";
    document.getElementById("noun-form").style.display = "none";
}

function storeNounself() {
    const nounField = document.getElementById("noun");

    // If no value provided, just focus the field
    if (!nounField.value.trim()) {
        nounField.focus();
        return;
    }

    const noun = nounField.value.trim().toLowerCase();

    sessionStorage.clear();
    sessionStorage.setItem("subjective", noun);
    sessionStorage.setItem("objective", noun);
    sessionStorage.setItem("possessiveDeterminer", noun);
    sessionStorage.setItem("possessive", noun + "s");
    sessionStorage.setItem("reflexive", noun + "self");
    sessionStorage.setItem("pluralVerbs", false);

    // Collapse form
    document.getElementById("noun-form").style.display = "none";
    addCustomPreset(`${uppercase(noun)}/${uppercase(noun)}self`);
}


/*--Pronoun sharing--*/

function onLoad() {
    /* Populate the preset dropdown/fill the pronoun fields from the url params */

    // Load theme from localstorage
    const theme = localStorage.getItem("theme");
    if (theme) {
        applyTheme(theme);
    }

    populatePresets();
    // Clear any stored pronouns
    sessionStorage.clear();

    window.addEventListener("hashchange", parseUrl);
    parseUrl();
}

function parseHashParts(hash) {
    // Limit to 6 - 5 pronoun types + "plural"
    parts = hash.split("/").slice(0, 6);
    // Decode each part
    parts = parts.map(decodeURIComponent);
    return parts;
}

function parseUrl() {
    // Populate name field
    // This will fall apart if ?name= isn't at the end of the url lol
    let name = window.location.hash.match(/\?name=(.*)/)?.[1];
    var nameField = document.getElementById("name");
    if (name) {
        nameField.value = name;
        showName(false);
    }

    const presetDropdown = document.getElementById("presets");

    // Extract the a/b/c/d/e part
    let pronounPartString = window.location.hash.match(/#\/([^\?]*)/)?.[1] ?? "";

    const parts = parseHashParts(pronounPartString);
    let isPlural = false;
    
    // 1 = preset, 5 = custom, 6 = custom w/ plural flag
    // If a preset is specified, use that
    if (parts.length === 1 && parts[0] in PRESETS) {
        document.getElementById("presets").value = parts[0];

        storePreset(parts[0]);
        populate();

        return;
    }
    else if (parts.length === 6 && parts[5] === "plural") {
        isPlural = true;
    }
    else if (parts.length !== 5) return;  // not 1, 5 or 6 so invalid. Ignore

    // Fill in the form fields based on the params
    for (let i=0; i<5; i++) {
        document.getElementById(PRONOUNFIELDS[i]).value = parts[i].trim().toLowerCase();
    }

    if (isPlural) {
        document.getElementById("plural").checked = true;
    }
    else {
        document.getElementById("singular").checked = true;
    }

    /* Set the options dropdown based on supplied values */

    const customForm = document.getElementById("custom");

    const hasFields = parts.some(p => p !== "");  // Whether the pronoun set contains non-empty strings
    if (validateFields()) {  // All fields are supplied
        storeCustom();
        populate();
    }
    // Only some fields are supplied
    else if (hasFields) {
        // Show the custom fields to be filled in
        presetDropdown.value = "custom";
        customForm.style.display = "block";
    }
    // No fields supplied
    else {
        // Show as blank
        presetDropdown.value = "select";
        customForm.style.display = "none";
    }
}

function getUrl() {
    /* Builds the sharable url */

    const baseUrl = window.location.origin + window.location.pathname.replace(/\/$/, "");
    var url = baseUrl + "/#/";

    /* Build the body of the url based on the selected pronouns */
    // If a preset is selected, directly use that
    const preset = document.getElementById("presets").value;
    if (preset in PRESETS) {
        url += preset;
    }

    // If nounself is selected, return url based on nounself template
    else if (preset === "nounself") {
        const noun = encodeURIComponent(document.getElementById("noun").value);

        url += `${noun}/${noun}/${noun}/${noun}s/${noun}self`;
    }

    // If preset is customConfig, the pronoun set is stored in sessionstorage
    else if (preset === "customConfig") {
        url += encodeURIComponent(sessionStorage.getItem("subjective")) +
            "/" + encodeURIComponent(sessionStorage.getItem("objective")) +
            "/" + encodeURIComponent(sessionStorage.getItem("possessiveDeterminer")) +
            "/" + encodeURIComponent(sessionStorage.getItem("possessive")) +
            "/" + encodeURIComponent(sessionStorage.getItem("reflexive")) +
            (sessionStorage.getItem("pluralVerbs") === "true" ? "/plural" : "")
    }

    // Assume custom
    else {
        // Get each form field's value and add to the query params if a value is set
        const parts = [];

        PRONOUNFIELDS.forEach(field => {
            const value = getCustomField(field);
            parts.push(encodeURIComponent(value));
        })

        if (document.getElementById("plural").checked) {
            parts.push("plural")
        }

        url += parts.join("/");
    }

    // Add name
    const name = sessionStorage.getItem("name");
    if (name) {
        url += `?name=${encodeURIComponent(name)}`
    }

    return url
}

function copyUrl() {
    const url = getUrl();
    navigator.clipboard.writeText(url);
    alert("Copied sharable url");
}


/* Name field */

function showName(select=true) {
    // Hide name button
    const button = document.getElementById("nameButton");
    button.style.display = "none";

    // Show name field and select it
    const nameField = document.getElementById("name");
    nameField.style.display = null;
    if (select) {nameField.select()};
}

function deselectName() {
    const nameField = document.getElementById("name");

    // If name is not blank, hide
    if (nameField.value.trim().length === 0) {
        hideName();
    }
}

function hideName() {
    // Show name button
    const button = document.getElementById("nameButton");
    button.style.display = null;

    // Hide name field
    const nameField = document.getElementById("name");
    nameField.style.display = "none";
}

/*--Pronoun population--*/

function storePreset(preset) {
    if (!(preset in PRESETS)) throw new Error("Invalid preset value");

    sessionStorage.clear();

    const pronounSet = PRESETS[preset].set;
    for (let i=0; i<PRONOUNFIELDS.length; i++) {
        sessionStorage.setItem(PRONOUNFIELDS[i], pronounSet[i]);
    }
    sessionStorage.setItem("pluralVerbs", PRESETS[preset].pluralVerbs || false);
}

function validateFields() {
    /* Returns true if all fields have a value */
    const fieldsCompleted = PRONOUNFIELDS.every(id => {
        const field = document.getElementById(id);
        const value = field.value.trim();

        if (!value) field.focus();
        return value;
    });
    const radioSelected = document.getElementById("singular").checked || document.getElementById("plural").checked;

    return fieldsCompleted && radioSelected;
}

function submitPronouns(event) {
    event.preventDefault();

    // Determine the source of the pronouns - custom fields or a preset
    const presetValue = document.getElementById("presets").value;

    if (presetValue === "custom") {
        if (!validateFields()) return;

        storeCustom();
    }
    else if (presetValue === "nounself") {
        storeNounself();
    }
    else if (presetValue in PRESETS) {
        storePreset(presetValue);
    }
    else return;  // No option selected - No need to populate again

    sessionStorage.setItem("name", document.getElementById("name").value);

    // Set url for this pronoun set
    window.history.pushState({}, "", getUrl());

    populate();
}

function setTitle() {
    function getTypeString(type) {
        const value = sessionStorage.getItem(type);
        return uppercase(value);
    }

    const titleSuffix = document.title.split(" | ").pop();
    const subjective = getTypeString("subjective");
    const objective = getTypeString("objective");
    const possessive = getTypeString("possessive");
    document.title = `${subjective}/${objective}/${possessive} | ${titleSuffix}`;
}

function setHint() {
    const parts = PRONOUNFIELDS.map(field => sessionStorage.getItem(field));
    const hint = parts.join("/");

    document.getElementById("hint").textContent = hint;
}

function populate() {
    setTitle();
    setHint();

    populateExamples();
    populatePractice();
}


function selectTab(tab) {
    // Remove the selected class from the current tab and add it to the clicked tab
    const tabs = document.getElementsByClassName("body__header__tab--selected");
    [...tabs].forEach(tab => {
        tab.classList.remove("body__header__tab--selected");
    });

    tab.classList.add("body__header__tab--selected");

    // Hide existing pages and show the page for the clicked tab
    const pages = document.getElementsByClassName("body__page");
    const tabName = tab.getAttribute("data-name");

    [...pages].forEach(page => {
        if (page.id === tabName) {
            page.style.display = "block";
        }
        else {
            page.style.display = "none";
        }
    })
}

function selectPrompts(maxValues = 6) {
    /* Selects an evenly distributed variety of prompts by the pronoun types they contain */    
    const categories = new Map();

    PROMPTS.forEach(prompt => {
        // Get the contained types
        const types = new Set();
        [...prompt.matchAll(/\{([a-z]+)\}/gi)].forEach(match => types.add(match[1]));

        // Check verbs presence
        if (VERB_REGEX.test(prompt)) {
            types.add("verbs");
        }

        // Add prompt to categories
        types.forEach(type => {
            if (!categories.has(type)) {
                categories.set(type, []);
            }
            categories.get(type).push(prompt);
        })
    })

    // Grab the needed number of prompts
    const prompts = [];

    while (prompts.length < maxValues && categories.size > 0) {
        categories.forEach((values, key) => {
            if (prompts.length < maxValues) {
                let selection;
                do {
                    // Get a random value and remove it from the list
                    const index = getRandomIndex(values);
                    selection = values.splice(index, 1)[0];
                    
                    if (!prompts.some(value => value === selection)) {
                        prompts.push(selection);
                    }

                    // If the values is now empty, remove that category
                    if (values.length === 0) {
                        categories.delete(key);
                        return;
                    }
                }
                while (!prompts.some(value => value === selection));
            }
        })
    }

    return shuffle(prompts);
}


/*--Example tab logic--*/

function populateExamples() {
    const pageDiv = document.getElementById("examples-cards");
    const cards = document.createDocumentFragment();

    selectPrompts().forEach((prompt, index) => {
        let sentence = prompt;

        // find/replace with the pronoun fields
        PRONOUNFIELDS.forEach(field => {
            const value = sessionStorage.getItem(field);
            sentence = sentence.replace(`{${field}}`, value);
        })
    
        // {singular/plural}
        const isPlural = sessionStorage.getItem("pluralVerbs") === "true";
        [...sentence.matchAll(VERB_REGEX)].forEach(([match, singular, plural]) => {
            sentence = sentence.replace(match, isPlural ? plural : singular);
        })

        sentence = uppercase(sentence);

        const card = createExampleCard(sentence, index);
        cards.appendChild(card) 
    })

    pageDiv.replaceChildren(cards);

    // Show button
    document.getElementById("examples-button").style.display = "block";
}


/*--Practice Tab Logic--*/

function pronounTypeToString(type) {
    // Add a space before all capitals
    type = type.replaceAll(/[A-Z]/g, (match) => ` ${match}`);
    return uppercase(type);
}

function isChallengeMode() {
    return document.getElementById("challenge-toggle").checked;
}

function populatePractice() {
    const pageDiv = document.getElementById("practice-cards");
    const cards = document.createDocumentFragment();

    selectPrompts().forEach((promptText, index) => {
        // Directly replace verbs text
        const isPlural = sessionStorage.getItem("pluralVerbs") === "true";
        [...promptText.matchAll(VERB_REGEX)].forEach(([match, singular, plural]) => {
            promptText = promptText.replace(match, isPlural ? plural : singular);
        })

        const prompt = document.createDocumentFragment();

        // Split prompt before and after the pronoun variables
        promptText.split(/(\{[a-z]+\})/i)
        .forEach(part => {
            const variableCheck = part.match(/\{([a-z]+)\}/i);
            // Add part as text node or field
            if (variableCheck) {
                const field = createPracticeField(variableCheck[1]);
                prompt.appendChild(field);
            }
            else {
                const text = document.createTextNode(part);
                prompt.appendChild(text);
            }
        });

        const card = createPracticeCard(prompt, index);
        cards.appendChild(card);
    })

    pageDiv.replaceChildren(cards);

    // Show/hide retry button
    if (isChallengeMode()) {
        document.getElementById("practice-button").style.display = "none";
    }
    else {
        document.getElementById("practice-button").style.display = "block";
    }
    
    document.getElementById("practice-options").style.display = "block";
}

function validatePrompt(event, form) {
    /* Check that all fields are completed, if not, focus the first uncompleted */
    event.preventDefault();

    const fields = form.querySelectorAll(".card__field");
    const allComplete = [...fields].every(answer => {
        if (!answer.value) {
            answer.select();
        }

        return !!answer.value;
    });

    if (allComplete) {
        checkAnswers(form);
    }
}

function checkAnswers(form) {
    const fields = form.querySelectorAll(".card__field");
    const card = form.parentElement;
    const cardButton = form.querySelector(".card__check");

    // Check the result of all fields
    let result = true;
    fields.forEach(field => {
        const type = field.getAttribute("data-type");
        const answer = sessionStorage.getItem(type);
        const isCorrect = field.value.toLowerCase().trim() === answer;

        if (isCorrect) {
            // Replace with a simple span
            const replacement = createCorrectReplacement(field.value);
            field.replaceWith(replacement);
        }
        else {
            if (isChallengeMode()) {
                // Insert correct answer
                const replacement = createIncorrectReplacement(field.value, answer);
                field.replaceWith(replacement);
            }
            else {
                // Show field as wrong
                field.classList.add("card__field--incorrect");
            }

            result = false;
        }
    });

    // Mark the card depending on the result
    if (result) {
        card.classList.add("card--correct");
        cardButton.style.display = "none";
    }
    else if (isChallengeMode()){
        card.classList.add("card--incorrect");
        cardButton.style.display = "none";
    }
    
    // Select the next field of the first unfilled card
    document.getElementById("practice").querySelector(".card__field")?.select();
    
    // When all cards are completed, show the retry button
    if (isChallengeMode()) {
        const cards = [...document.getElementById("practice").querySelectorAll(".card")];
        const allSubmitted = cards.every(card => card.classList.contains("card--correct") || card.classList.contains("card--incorrect"));
        if (allSubmitted) {
            document.getElementById("practice-button").style.display = "block";
        }
    }
}


/*--Theme--*/
function toggleThemes() {
    const themes = document.getElementById("themes");

    if (themes.style.display) {  // display is "none" -> make visible
        themes.style.display = null;

        themes.animate(
            {transform: ["scaleX(0)", "scaleX(1)"]},
            {duration: 150, easing: "ease-out"}
        )
    }
    else {  // display is null -> make hidden
        const anim = themes.animate(
            {transform: ["scaleX(1)", "scaleX(0)"]},
            {duration: 150, easing: "ease-out"}
        )
        
        anim.onfinish = () => themes.style.display = "none";
    }
}

function selectTheme(theme) {
    applyTheme(theme);

    localStorage.setItem("theme", theme);
}

function applyTheme(theme) {
    document.body.setAttribute("data-theme", theme);

    const colour = getComputedStyle(document.body).getPropertyValue("--primary");
    document.querySelector("meta[name=theme-color]").content = colour;
}

