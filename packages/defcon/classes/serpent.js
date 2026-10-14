// Serpent: defences. See classes/README.md. Skills: Subterfuge, Venom,
// Hypnosis. Nothing is sent on DEFCON INIT.
// Scales (balance, mildly protective) are free once up: DEFCON 4.
// Weaving and hiding are the hunting keys' Weave and Sneak toggles, so
// DEFCON leaves them alone (it would fight the toggle). Pacing and phase
// are for chasing or avoiding adventurers.
D.classes["Serpent"] = {
  init: [],
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
    ["scales", 4, 10]
  ]
};
