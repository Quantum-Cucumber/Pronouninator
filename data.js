const PRESETS = {
    ae: {
        name: "Ae/Aer",
        set: ["ae", "aer", "aer", "aers", "aerself"],
        categories: ["misc"],
    },
    ey: {
        name: "Ey/Em",
        set: ["ey", "em", "eir", "eirs", "emself"],
        categories: ["misc"],
    },
    fae: {
        name: "Fae/Faer",
        set: ["fae", "faer", "faer", "faers", "faerself"],
        categories: ["mythical"],
    },
    he: {
        name: "He/Him",
        set: ["he", "him", "his", "his", "himself"],
        categories: ["traditional"],
    },
    it: {
        name: "It/Its",
        set: ["it", "it", "its", "its", "itself"],
        categories: ["gender neutral"],
    },
    she: {
        name: "She/Her",
        set: ["she", "her", "her", "hers", "herself"],
        categories: ["traditional"],
    },
    they: {
        name: "They/Them",
        set: ["they", "them", "their", "theirs", "themself"],
        pluralVerbs: true,
        categories: ["traditional", "gender neutral"],
    },
    thon: {
        name: "Thon/Thons",
        set: ["thon", "thon", "thons", "thons", "thonself"],
        categories: ["gender neutral"],
    },
    xe: {
        name: "Xe/Xem",
        set: ["xe", "xem", "xyr", "xyrs", "xemself"],
        categories: ["gender neutral"],
    },
}
 
const PROMPTS = [
    "{subjective} {is/are} a great friend.",
    "{subjective} {loves/love} cats.",
    "I think {subjective} {is/are} awesome.",
    "{subjective} {has/have} cool hair.",
    
    "That belongs to {objective}.",
    "I already asked {objective} that.",
    "I saw {objective} with {possessiveDeterminer} best friend.",
    "{subjective} put {possessiveDeterminer} backpack on.",

    "That's {possessiveDeterminer} pencil.",
    "I love {possessiveDeterminer} hair.",
    "{possessiveDeterminer} room is upstairs.",
    "{possessiveDeterminer} shirt is awesome.",
    "A smile lit up {possessiveDeterminer} face.",
    "I love {possessiveDeterminer} cooking.",

    "That book is {possessive}.",
    "I like your shoes but {possessive} are amazing.",
    "I found my seat but {subjective} {was/were} still looking for {possessive}.",

    "{subjective} made {reflexive} a sandwich.",
    "{subjective} drew that all by {reflexive}.",
    "{subjective} bought {reflexive} a car.",
    "{subjective} sat all by {reflexive}."
]