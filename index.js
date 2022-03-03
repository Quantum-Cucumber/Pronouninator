const PRESETS = {
    he: {
        subjective: "he",
        objective: "him",
        possessive: "his",
        reflexive: "himself",
        singular: true,
    },
    she: {
        subjective: "she",
        objective: "her",
        possessive: "hers",
        reflexive: "herself",
        singular: true,
    },
    they: {
        subjective: "they",
        objective: "them",
        possessive: "theirs",
        reflexive: "themself",
        singular: false,
    },
}


function selectPreset(e) {
    const preset = PRESETS[e.value];
    
    document.getElementById("subjective").value = preset.subjective;
    document.getElementById("objective").value = preset.objective;
    document.getElementById("possessive").value = preset.possessive;
    document.getElementById("reflexive").value = preset.reflexive;
}