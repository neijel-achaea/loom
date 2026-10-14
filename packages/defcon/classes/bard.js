// Bard: DEFCON UP commands and defences. See classes/README.md.
// Tempo is a footwork setting, not a defence: DEFCON UP sets MODERATO on
// balance, and it can be changed by hand at any time. Blade tune (balance)
// and grip (balance, keeps weapons from being knocked away) are free once up.
// Acrobatics (harder to hit) drains endurance heavily and doesn't seem to
// help against denizens: full alert only. Balancing (harder to knock down)
// drains mana. Both are relaxed below DEFCON 1.
// Composition's movements only last while a song plays, and Sagas has no
// self defence, so neither adds anything here.
D.classes["Bard"] = {
  up: ["queue add bal tempo moderato"],
  defs: [
    ["alertness", 1, 10, true],
    ["vigilance", 1, 10, true],
    ["hypersight", 1, 9, true],
    ["telesense", 1, 10, true],
    ["metawake", 1, 9, true],
    ["mass", 2, 8],
    ["heldbreath", 2, 20],
    ["fangbarrier", 3, 8],
    ["deafness", 3, 4],
    ["blindness", 3, 4],
    ["kola", 3, 3],
    ["levitating", 3, 15],
    ["speed", 3, 5],
    ["poisonresist", 3, 8],
    ["nightsight", 4, 13],
    ["deathsight", 4, 18],
    ["thirdeye", 3, 5],
    ["insomnia", 2, 6],
    ["selfishness", 2, 17],
    ["mindseye", 5, 1],
    ["temperance", 3, 8],
    ["tune", 4, 10],
    ["gripping", 4, 12],
    ["acrobatics", 1, 11, true],
    ["balancing", 1, 14, true]
  ]
};
