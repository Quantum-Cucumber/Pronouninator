const PRESETS = {
    ae: {
        name: "Ae/Aer",
        set: ["ae", "aer", "aer", "aers", "aerself"],
    },
    ey: {
        name: "Ey/Em",
        set: ["ey", "em", "eir", "eirs", "emself"],
    },
    fae: {
        name: "Fae/Faer",
        set: ["fae", "faer", "faer", "faers", "faerself"],
    },
    he: {
        name: "He/Him",
        set: ["he", "him", "his", "his", "himself"],
    },
    it: {
        name: "It/Its",
        set: ["it", "it", "its", "its", "itself"],
    },
    she: {
        name: "She/Her",
        set: ["she", "her", "her", "hers", "herself"],
    },
    they: {
        name: "They/Them",
        set: ["they", "them", "their", "theirs", "themself"],
        pluralVerbs: true,
    },
    thon: {
        name: "Thon/Thons",
        set: ["thon", "thon", "thons", "thons", "thonself"],
    },
    xe: {
        name: "Xe/Xem",
        set: ["xe", "xem", "xyr", "xyrs", "xemself"],
    },
    zehir: {
        name: "Ze/Hir",
	    set: ["ze", "hir", "hir", "hirs", "hirself"],
    },
    zezir: {
        name: "Ze/Zir",
        set: ["ze", "zir", "zir", "zirs", "zirself"],
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