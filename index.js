const PRONOUNFIELDS = ["subjective", "objective", "possessiveDeterminer", "possessive", "reflexive"]
const VERB_REGEX = /\{(.+)\/(.+)\}/gi;

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


function selectPreset(presetString) {
    /* Fills the form fields based on the preset string */

    if (presetString === "custom") {
        document.getElementById("custom").style.display = "block";
    }
    else {
        document.getElementById("custom").style.display = "none";
    }

    // If not a preset value, make the fields empty
    if (!(presetString in PRESETS)) {
        PRONOUNFIELDS.forEach(field => {
            document.getElementById(field).value = null;
        })
        document.getElementById("singular").checked = false;
        document.getElementById("plural").checked = false;
        return;
    }

    const preset = PRESETS[presetString];

    PRONOUNFIELDS.forEach(field => {
        document.getElementById(field).value = preset[field];
    })

    if (preset.singularVerbs) {
        document.getElementById("singular").checked = true;
    }
    else {
        document.getElementById("plural").checked = true;
    }
}


/*--Pronoun sharing--*/

function onLoad() {
    /* Populate the preset dropdown/fill the pronoun fields from the url params */

    // Populate dropdown
    const presetDropdown = document.getElementById("presets");
    const lastOption = presetDropdown.children[presetDropdown.children.length - 1];
    for (const key in PRESETS) {
        const node = document.createElement("option");
        node.value = key;
        node.innerHTML = PRESETS[key].name;
        presetDropdown.insertBefore(node, lastOption);
    }

    // Get the url params
    const params = new URLSearchParams(window.location.search);

    // If a preset is specified, use that
    if (params.has("preset")) {
        const preset = params.get("preset");
        document.getElementById("presets").value = preset;
        selectPreset(preset);
        setTitle();
        populatePages();

        return;
    }

    // Set as custom if there are any fields supplied
    const hasFields = PRONOUNFIELDS.some(param => params.has(param)) || params.get("singularVerbs");
    if (hasFields) {
        document.getElementById("presets").value = "custom";
        document.getElementById("custom").style.display = "block";
    }
    else {
        document.getElementById("presets").value = "select";
        document.getElementById("custom").style.display = "none";
    }

    // Fill in the form fields based on the params
    PRONOUNFIELDS.forEach(field => {
        document.getElementById(field).value = params.get(field);
    })

    document.getElementById("singular").checked = params.get("singularVerbs") === "true";
    document.getElementById("plural").checked = params.get("singularVerbs") === "false";

    // If all fields are supplied, load the page
    if (validateFields()) {
        populatePages();
    }
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
    PRONOUNFIELDS.forEach(field => {
        const value = document.getElementById(field).value;
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


function validateFields() {
    /* Returns true if all fields have a value */
    const fieldsCompleted = PRONOUNFIELDS.every(id => document.getElementById(id).value);
    const radioSelected = document.getElementById("singular").checked || document.getElementById("plural").checked;

    return fieldsCompleted && radioSelected;
}

function usePronouns() {
    const errorDiv = document.getElementById("error");
    if (validateFields()) {
        errorDiv.innerHTML = null;
    }
    else {
        errorDiv.innerHTML = "Please ensure all fields are completed";
        return;
    }

    const url = getUrl();
    window.history.pushState({}, "", url);

    setTitle();
    populatePages();
}

function populatePages() {
    populateExamples();
    populatePractice();
}

function setTitle() {
    function getPartString(part) {
        let value = document.getElementById(part).value;
        // Lowercase then capitalise the first character
        return value.toLowerCase().replace(/^[a-z]/, char => char.toUpperCase());
    }

    const titleSuffix = document.title.split(" | ").pop();
    const subjective = getPartString("subjective");
    const objective = getPartString("objective");
    const possessive = getPartString("possessive");
    document.title = `${subjective}/${objective}/${possessive} | ${titleSuffix}`;
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

function selectPrompts(maxValues = 5) {
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
            if (categories.has(type)) {
                categories.get(type).push(prompt);
            }
            else {
                categories.set(type, [prompt]);
            }
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
    const pageDiv = document.getElementById("examples");
    pageDiv.innerHTML = null;

    selectPrompts().forEach((prompt, index) => {
        let sentence = prompt;

        // find/replace with the pronoun fields
        PRONOUNFIELDS.forEach(field => {
            const value = document.getElementById(field).value.toLowerCase();
            sentence = sentence.replace(`{${field}}`, value);
        })
    
        // {singular/plural}
        const isSingular = document.getElementById("singular").checked;
        [...sentence.matchAll(VERB_REGEX)].forEach(([match, singular, plural]) => {
            sentence = sentence.replace(match, isSingular ? singular : plural);
        })

        // Make the first character uppercase
        sentence = sentence.replace(/^[a-z]/, char => char.toUpperCase());

        const card = document.createElement("div");
        card.classList.add("card");
        card.style.setProperty("--offset", index);
        card.innerHTML = sentence;
        pageDiv.appendChild(card) 
    })
}


/*--Practice Tab Logic--*/

function pronounTypeToString(type) {
    // Add a space before all capitals
    type = type.replaceAll(/[A-Z]/g, (match) => ` ${match}`);
    // Make the first letter uppercase
    return type.replace(/^[a-z]/, char => char.toUpperCase());
}

function populatePractice() {
    const pageDiv = document.getElementById("practice");
    pageDiv.innerHTML = null;

    selectPrompts().forEach((prompt, index) => {
        prompt = prompt.replaceAll(/\{([a-z]+)\}/gi,
            (_match, type) => {
                const answer = document.getElementById(type).value.trim().toLowerCase();
                return `<input class="card__field" data-answer="${answer}" title="${pronounTypeToString(type)}" />`
            }
        );

        const isSingular = document.getElementById("singular").checked;
        [...prompt.matchAll(VERB_REGEX)].forEach(([match, singular, plural]) => {
            prompt = prompt.replace(match, isSingular ? singular : plural);
        })

        pageDiv.innerHTML += `<div class="card card--pratice" style="--offset: ${index};">
            <form onsubmit="validatePrompt(event, this)">
                ${prompt}
                <input type="submit" class="card__check" value=""/>
            </form>
        </div>`
    })
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
        const answer = field.getAttribute("data-answer");
        const isCorrect = field.value.toLowerCase().trim() === answer;

        if (isCorrect) {
            field.classList.add("card__field--correct");
            field.classList.remove("card__field--wrong");

            // Replace with 
            const replacement = document.createElement("span");
            replacement.classList.add("card__answer");
            replacement.innerHTML = field.value;
            field.replaceWith(replacement);
        }
        else {
            field.classList.add("card__field--wrong");

            // Insert correct answer ~ TODO - Only in quiz mode
            const replacement = document.createElement("span");
            replacement.classList.add("card__answer");
            replacement.innerHTML = `<span class="card__answer__wrong">${field.value}</span> ${answer}`;
            field.replaceWith(replacement);

            result = false;
        }
    });

    if (result) {
        card.classList.add("card--correct");
        cardButton.style.display = "none";
    }
    else {  // TODO: Only if quiz mode
        card.classList.add("card--wrong");
        cardButton.style.display = "none";
    }

    // Select next card's field
    card.nextElementSibling?.querySelector(".card__field").select();  // TODO - Quiz mode
}
