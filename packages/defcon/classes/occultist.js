// Occultist: defences. See classes/README.md. Skills: Occultism,
// Domination, Tarot. Nothing is sent on DEFCON UP.
// Distortaura (karma, then a steady mana drain) feeds back physical damage
// and softens some denizen damage: DEFCON 1, taken down with NORMALAURA
// below. Simulacrum and heartstone cost karma on every raise, so curing
// doesn't keep them; simulacrum is a hunting panic key (F11).
D.classes["Occultist"] = {
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
    ["distortaura", 1, 14, "normalaura"]
  ]
};
