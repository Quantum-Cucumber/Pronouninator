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


function selectPreset(element) {
    const preset = PRESETS[element.value];
    
    document.getElementById("subjective").value = preset.subjective;
    document.getElementById("objective").value = preset.objective;
    document.getElementById("possessive").value = preset.possessive;
    document.getElementById("possessivePlural").value = preset.possessivePlural;
    document.getElementById("reflexive").value = preset.reflexive;

    if (preset.singular) {
        document.getElementById("singular").checked = true;
    }
    else {
        document.getElementById("plural").checked = true;
    }
}
