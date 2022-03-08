const PRESETS = {
    they: {
        name: "They/Them",
        subjective: "they",
        objective: "them",
        possessiveDeterminer: "their",
        possessive: "theirs",
        reflexive: "themself",
        singularVerbs: false,
    },
    xe: {
        name: "Xe/Xem",
        subjective: "xe",
        objective: "xem",
        possessiveDeterminer: "xyr",
        possessive: "xyrs",
        reflexive: "xemself",
        singularVerbs: true,
    },
    it: {
        name: "It/Its",
        subjective: "it",
        objective: "it",
        possessiveDeterminer: "its",
        possessive: "its",
        reflexive: "itself",
        singularVerbs: true,
    },
    she: {
        name: "She/Her",
        subjective: "she",
        objective: "her",
        possessiveDeterminer: "her",
        possessive: "hers",
        reflexive: "herself",
        singularVerbs: true,
    },
    he: {
        name: "He/Him",
        subjective: "he",
        objective: "him",
        possessiveDeterminer: "his",
        possessive: "his",
        reflexive: "himself",
        singularVerbs: true,
    },
}

const PROMPTS = [
    "{subjective} {is/are} a great friend.",
    "{subjective} {loves/love} cats.",
    "I think {subjective} is awesome.",
    "{subjective} {has/have} cool hair.",
    
    "That belongs to {objective}.",
    "I already asked {objective} that.",
    "I saw {objective} vent!",
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