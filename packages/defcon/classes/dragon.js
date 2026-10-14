// Dragon: DEFCON INIT commands and defences. See classes/README.md.
// Every dragon colour uses this table (D.alias in defcon_classes.js).
// Same tiers as the generic table (the README's questions). Own defences:
// dragonarmour (500 mana, then drains willpower and endurance: 3, relaxed
// below it) and dragonbreath (SUMMON, 300 mana once: 4).
D.classes["Dragon"] = {
  init: ["dragonarmour"],
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
    ["insulation", 3, 8],
    ["nightsight", 4, 13],
    ["deathsight", 4, 18],
    ["thirdeye", 3, 5],
    ["insomnia", 2, 6],
    ["selfishness", 2, 17],
    ["mindseye", 5, 1],
    ["dragonbreath", 4, 10],
    ["dragonarmour", 3, 5, true],
    ["temperance", 3, 8]
  ]
};
