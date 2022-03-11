const PRONOUNFIELDS = ["subjective", "objective", "possessiveDeterminer", "possessive", "reflexive"]
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

function populateCategories() {
    /* Insert preset categories into the dropdown */

    // Get all categories from the presets
    const categories = new Set();
    Object.values(PRESETS).forEach(preset => {
        preset.categories.forEach(category => categories.add(category));
    })

    const categoriesDropdown = document.getElementById("categories");

    // Create all the options
    const newOptions = document.createDocumentFragment();

    [...categories].sort((a, b) => a > b)  // Alphabetical order
    .forEach(category => {
        const option = createOption(category, titlecase(category));
        newOptions.appendChild(option);
    })

    // Needs to go at the end
    const customOption = createOption("custom", "Custom");
    newOptions.appendChild(customOption);

    categoriesDropdown.appendChild(newOptions);  // (Note - populateCategories is only called in onLoad so this is fine)
}


function selectCategory(category) {
    // Show custom fields if needed
    if (category === "custom") {
        document.getElementById("custom").style.display = "block";
    }
    else {
        document.getElementById("custom").style.display = "none";
    }

    const presetDropdown = document.getElementById("presets");
    
    // Show preset dropdown if a category is selected
    if (category === "custom" || category === "select") {
        presetDropdown.style.display = "none";
        presetDropdown.value = "select";
    }
    else {
        presetDropdown.style.display = "block";
    }

    // Create preset options
    const presetOptions = document.createDocumentFragment();

    // Create the default select option
    const selectOption = createOption("select", "--Select--");
    selectOption.hidden = true;
    selectOption.selected = true;
    presetOptions.appendChild(selectOption)

    // Add presets from that category to the preset dropdown
    for (const key in PRESETS) {
        const preset = PRESETS[key];

        if (preset.categories.indexOf(category) !== -1) {
            const option = createOption(key, preset.name);
            presetOptions.appendChild(option);
        }
    }

    presetDropdown.replaceChildren(presetOptions);
}

function storeCustom() {
    /* Custom values are collapsed, stored and made visible in the dropdown */
    const categoryDropdown = document.getElementById("categories");

    // Removing existing custom config option
    categoryDropdown.querySelectorAll("option[value=customConfig]").forEach(el => el.remove());

    // Create custom dropdown value
    const title = `${getCustomField("subjective")}/${getCustomField("objective")}/${getCustomField("possessive")}`;
    const option = createOption("customConfig", title);
    option.hidden = true;
    categoryDropdown.appendChild(option);
    categoryDropdown.value = "customConfig";

    // Hide fields
    document.getElementById("custom").style.display = "none";

    // Store values
    sessionStorage.clear();

    PRONOUNFIELDS.forEach(field => {
        sessionStorage.setItem(field, getCustomField(field));
    })
    sessionStorage.setItem("singularVerbs", document.getElementById("singular").checked);
}


/*--Pronoun sharing--*/

function onLoad() {
    /* Populate the preset dropdown/fill the pronoun fields from the url params */

    populateCategories();
    // Clear any stored pronouns
    sessionStorage.clear();

    window.addEventListener("hashchange", parseUrl);
    parseUrl();
}

function cleanHash(hash) {
    hash = hash.replace(/^#?\/?/, "");
    parts = hash.split("/").slice(0, 6);  // Limit to 6 - 5 pronoun types + "plural"
    return parts;
}

function parseUrl() {
    const categoryDropdown = document.getElementById("categories");

    // Gets the url to be read
    const parts = cleanHash(window.location.hash);
    let isPlural = false;

    // If a preset is specified, use that
    if (parts.length === 1 && parts[0] in PRESETS) {
        // Show the preset in the category dropdown
        const presetValues = PRESETS[parts[0]];
        const option = createOption("customConfig", presetValues.name);
        option.hidden = true;
        categoryDropdown.appendChild(option);
        // Select that option
        categoryDropdown.value = "customConfig";

        storePreset(parts[0]);
        populate();

        return;
    }
    else if (parts.length === 6 && parts[5] === "plural") {
        isPlural = true;
    }
    else if (parts.length !== 5) return;

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

    // Set the options dropdown based on supplied values
    const customForm = document.getElementById("custom");

    const hasFields = parts.some(p => p !== "");
    if (validateFields()) {  // All fields are supplied
        storeCustom();
        populate();
    }
    else if (hasFields) {
        categoryDropdown.value = "custom";
        customForm.style.display = "block";
    }
    else {
        categoryDropdown.value = "select";
        customForm.style.display = "none";
    }
}

function getUrl() {
    /* Builds the sharable url */

    const baseUrl = window.location.origin + window.location.pathname.replace(/\/$/, "");
    const parts = [];

    // If a preset is selected, directly use that
    const preset = document.getElementById("presets").value;
    if (preset in PRESETS) {
        return baseUrl + "/#/" + preset;
    }

    // Get each form field's value and add to the query params if a value is set
    PRONOUNFIELDS.forEach(field => {
        const value = getCustomField(field);
        parts.push(value);
    })

    if (document.getElementById("plural").checked) {
        parts.push("plural")
    }

    return baseUrl + "/#/" + parts.join("/");
}

function copyUrl() {
    const url = getUrl();
    navigator.clipboard.writeText(url);
    alert("Copied sharable url");
}


/*--Pronoun population--*/

function storePreset(preset) {
    if (!(preset in PRESETS)) throw new Error("Invalid preset value");

    sessionStorage.clear();

    const values = PRESETS[preset];
    for (const value in values) {
        sessionStorage.setItem(value, values[value]);
    }
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
    const categoryValue = document.getElementById("categories").value;
    const presetValue = document.getElementById("presets").value;

    if (categoryValue === "custom") {
        if (!validateFields()) return;

        storeCustom();
    }
    else if (presetValue in PRESETS) {
        storePreset(presetValue);
    }
    else return;  // No need to repopulate

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
        const isSingular = sessionStorage.getItem("singularVerbs") === "true";;
        [...sentence.matchAll(VERB_REGEX)].forEach(([match, singular, plural]) => {
            sentence = sentence.replace(match, isSingular ? singular : plural);
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

function isQuizMode() {
    return document.getElementById("quiz-toggle").checked;
}

function populatePractice() {
    const pageDiv = document.getElementById("practice-cards");
    const cards = document.createDocumentFragment();

    selectPrompts().forEach((promptText, index) => {
        // Directly replace verbs text
        const isSingular = sessionStorage.getItem("singularVerbs") === "true";
        [...promptText.matchAll(VERB_REGEX)].forEach(([match, singular, plural]) => {
            promptText = promptText.replace(match, isSingular ? singular : plural);
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

    // Save quiz mode value for this round
    if (isQuizMode()) {
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
            if (isQuizMode()) {
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

    if (result) {
        card.classList.add("card--correct");
        cardButton.style.display = "none";
    }
    else if (isQuizMode()){
        card.classList.add("card--incorrect");
        cardButton.style.display = "none";
    }

    // Select next card's field
    card.nextElementSibling?.querySelector(".card__field")?.select();

    if (isQuizMode()) {
        const cards = [...document.getElementById("practice").querySelectorAll(".card")];
        const allSubmitted = cards.every(card => card.classList.contains("card--correct") || card.classList.contains("card--incorrect"));
        if (allSubmitted) {
            document.getElementById("practice-button").style.display = "block";
        }
    }
}
