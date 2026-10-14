// Monk: DEFCON UP commands and defences. See classes/README.md.
// Skills: Tekura, Kaido, Telepathy.
// DEFCON UP takes the Eagle stance (EGS) on balance: the hunting combo
// (sidekick, uppercut, uppercut) is built for it.
// Toughness (less cutting damage), vitality (a big heal under 25% health;
// only raised near full health and mana) and weathering (+1 constitution)
// are free once up: DEFCON 4. Projectiles and dodging drain mana and
// willpower: DEFCON 1, relaxed below. Bodyblock is a hunting toggle (F11).
D.classes["Monk"] = {
  up: ["queue add bal egs"],
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
    ["toughness", 4, 10],
    ["vitality", 4, 7],
    ["weathering", 4, 12],
    ["projectiles", 1, 14, true],
    ["dodging", 1, 15, true]
  ]
};
