// Druid: DEFCON UP commands and defences. See classes/README.md.
// Morphs to wyvern and flails the staff first.
D.classes["Druid"] = {
  up: ["morph wyvern", "queue add eq embrace spirit", "queue add equilibrium summon fire", "flail staff"],
  defs: [
    ["alertness", 1, 10, true],
    ["vigilance", 1, 10, true],
    ["hypersight", 1, 9, true],
    ["telesense", 1, 10, true],
    ["metawake", 1, 9, true],
    ["mass", 2, 8],
    ["rebounding", 2, 2],
    ["heldbreath", 2, 20],
    ["fangbarrier", 3, 8],
    ["deafness", 3, 4],
    ["blindness", 3, 4],
    ["temperance", 3, 12],
    ["vitality", 3, 7],
    ["curseward", 2, 9],
    ["kola", 3, 3],
    ["levitating", 3, 15],
    ["speed", 3, 5],
    ["harmony", 3, 11],
    ["poisonresist", 3, 8],
    ["nightsight", 4, 13],
    ["deathsight", 4, 18],
    ["thirdeye", 4, 5],
    ["insomnia", 2, 6],
    ["selfishness", 2, 17],
    ["mindseye", 5, 1]
  ]
};
