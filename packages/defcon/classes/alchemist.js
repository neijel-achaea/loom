// Alchemist: DEFCON UP commands and defences. See classes/README.md.
// Sulphur and mercury (EDUCE, 350 mana each, equilibrium) make health and
// mana elixirs heal more; they wear off and are re-educed. Not kept:
// tin (500 mana, reflects two attacks: a hunting key instead), lead
// (density: the mass salve covers it), extispicy (needs a rat corpse).
D.classes["Alchemist"] = {
  up: [],
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
    ["sulphur", 3, 12],
    ["mercury", 3, 14]
  ]
};
