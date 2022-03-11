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


function getCustomField(id) {
    return document.getElementById(id).value.trim().toLowerCase();
}

function selectPreset(presetString) {
    /* Hide/show the custom fields if the custom option is selected */

    if (presetString === "custom") {
        document.getElementById("custom").style.display = "block";
    }
    else {
        document.getElementById("custom").style.display = "none";
    }
}

function storeCustom() {
    /* Custom values are collapsed and stored */
    const presetDropdown = document.getElementById("presets");

    // Removing existing custom config option
    presetDropdown.querySelector("option[value=customConfig]")?.remove();

    // Create custom dropdown value
    const title = `${getCustomField("subjective")}/${getCustomField("objective")}/${getCustomField("possessive")}`;
    const option = createOption("customConfig", title);
    option.hidden = true;
    presetDropdown.appendChild(option);
    presetDropdown.value = "customConfig";

    // Hide fields
    document.getElementById("custom").style.display = "none";

    // Store values
    sessionStorage.clear();

    PRONOUNFIELDS.forEach(field => {
        sessionStorage.setItem(field, getCustomField(field));
    })
    sessionStorage.setItem("singularVerbs", document.getElementById("singular").checked);
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


/*--Pronoun sharing--*/

function onLoad() {
    /* Populate the preset dropdown/fill the pronoun fields from the url params */
    const presetDropdown = document.getElementById("presets");
    const customForm = document.getElementById("custom");

    // Populate dropdown with the preset pronoun sets
    const lastOption = presetDropdown.children[presetDropdown.children.length - 1];
    for (const key in PRESETS) {
        const option = createOption(key, PRESETS[key].name);
        presetDropdown.insertBefore(option, lastOption);
    }

    // Clear any stored pronouns
    sessionStorage.clear();

    // Get the url params
    const params = new URLSearchParams(window.location.search);

    // If a preset is specified, use that
    if (params.has("preset") && params.get("preset") in PRESETS) {
        const preset = params.get("preset");
        presetDropdown.value = preset;
        selectPreset(preset);
        storePreset(preset);
        populate();

        return;
    }

    // Fill in the form fields based on the params
    PRONOUNFIELDS.forEach(field => {
        document.getElementById(field).value = params.get(field)?.trim().toLowerCase() || null;
    })

    document.getElementById("singular").checked = params.get("singularVerbs") === "true";
    document.getElementById("plural").checked = params.get("singularVerbs") === "false";

    // Set the options dropdown based on supplied values
    const hasFields = PRONOUNFIELDS.some(param => params.has(param)) || params.get("singularVerbs");
    if (validateFields()) {  // All fields are supplied
        storeCustom();
        populate();
    }
    else if (hasFields) {
        presetDropdown.value = "custom";
        customForm.style.display = "block";
    }
    else {
        presetDropdown.value = "select";
        customForm.style.display = "none";
    }
}

function getUrl() {
    /* Builds the sharable url */

    const baseUrl = window.location.href.split("?")[0];
    const params = [];

    // If a preset is selected, directly use that
    const presetDropdown = document.getElementById("presets");
    if (presetDropdown.value in PRESETS) {
        return baseUrl + "?preset=" + presetDropdown.value;
    }

    // Get each form field's value and add to the query params if a value is set
    PRONOUNFIELDS.forEach(field => {
        const value = getCustomField(field);
        if (value) {
            params.push(field + "=" + value);
        }
    })

    // Determine if the pronouns are singular or plural and add to params
    if (document.getElementById("singular").checked) {
        params.push("singularVerbs=true");
    }
    else if (document.getElementById("plural").checked) {
        params.push("singularVerbs=false");
    }

    return baseUrl + "?" + params.join("&");
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

    // If a custom value was set up, hide the custom fields and set the dropdown text
    const presetValue = document.getElementById("presets").value;
    if (presetValue === "custom") {
        if (!validateFields()) return;

        storeCustom();
    }
    else if (presetValue in PRESETS) {
        storePreset(presetValue);
    }
    else if (presetValue === "select") return;
    // Else, value is custom and should already be set

    // Set url for this set of pronouns
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
