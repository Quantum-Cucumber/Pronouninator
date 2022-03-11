# Contributing
Contributions are very welcome, but note that at this state the project is still considered to be in early development.


## New Pronoun Presets
Pronoun presets are stored in [data.js](src/data.js).
```js
// Example preset:
    she: {
        name: "She/Her",
        subjective: "she",
        objective: "her",
        possessiveDeterminer: "her",
        possessive: "hers",
        reflexive: "herself",
        singularVerbs: true,
        categories: ["traditional"],
    },
```
All fields are mandatory.
- The key of this object is arbitrary but as a general rule, should be the same as the `subjective` field.
- The `name` field refers to how the pronoun set would be colloquially expressed, e.g. `She/Her`, or `Xe/Xem`. This should be in title case.
- `singularVerbs` is a boolean referring to whether verbs should be made singular or not, e.g. `He *runs*.` vs `They *run*.`
- `categories` defines which categories a set of pronouns should appear under. If you are adding a new category, please try and add multiple sets that could be placed into that category.
- Presets should be placed in alphabetical order (by key) just for neatness.


## New Examples/Questions
Prompts are stored in [data.js](src/data.js).
```js
// Example prompt
    "{subjective} {walks/walk} home.",
```
- Prompts should contain a singular sentence, ending with a period.
- Prompts should only refer to one person who uses a single set of pronouns.
    - Good: `They love their cat.`
    - Bad: `He baked a cake for him.`, `Xe loves his hat.`
- Third person pronouns in your sentence should be replaced with the type of pronoun (refer to the preset's fields if needed), surrounded by curly braces - `{}`.
    - `he` -> `{subjective}`
    - `herself` -> `{reflexive}`
- For verbs that change depending on whether the pronoun set is singular or plural, these should be written in the format of `{singular option/plural option}`.
    - `{walks/walk}` -> `She *walks*` or `They *walk*`.
- Remember that all prompts can be used as either an example or a question, so ensure that the type of pronoun is obvious when removed from the sentence.
