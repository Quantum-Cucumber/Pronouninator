# Contributing
Contributions are very welcome :)


## New Pronoun Presets
Pronoun presets are stored in [data.js](src/data.js).
```js
// Example preset:
they: {
    name: "They/Them",
    set: ["they", "them", "their", "theirs", "themself"],
    pluralVerbs: true,
},
```
All fields are mandatory.
- The key of this object is mostly arbitrary but will be used in the shareable URL. In general, this should be set to the subjective form of the pronoun.
- The `name` field refers to how the pronoun set would be colloquially expressed, e.g. `She/Her`, or `Xe/Xem`. This should be in title case. Used in the pronoun dropdowns.
- `set` is the full pronoun set in the form of `subjective, objective, possessive determiner, possessive, reflexive`.
- `pluralVerbs` is a optional boolean referring to whether verbs should be made plural or not, e.g. `He *runs*` (singular) vs `They *run*` (plural). If ommited, it will be assumed that the pronoun set uses singular verbs.
- Presets should be placed in alphabetical order (by key) just for neatness.


## New Examples/Questions
Prompts are stored in [data.js](src/data.js).
```js
// Example prompt
"{subjective} {walks/walk} home."
```
- Prompts should contain a singular sentence, ending with a period.
- Prompts should only refer to one person who uses a single set of pronouns.
    - Good: `They love their cat.`
    - Bad: `He baked a cake for him.`, `Xe loves his hat.`
- Third person pronouns in your sentence should be replaced with the type of pronoun, surrounded by curly braces - `{}`.
    - `he` -> `{subjective}`
    - `herself` -> `{reflexive}`
- For verbs that change depending on whether the pronoun set is singular or plural, these should be written in the format of `{singular option/plural option}`.
    - `{walks/walk}` -> `She *walks*` or `They *walk*`.
- Remember that all prompts can be used as either an example or a question, so ensure that the type of pronoun is obvious when removed from the sentence.
