// Unnamable: defences. See classes/README.md. Skills: Weaponmastery,
// Dominion (the knights' shared skill), Anathema. Nothing is sent on
// DEFCON UP.
// Free once up (DEFCON 4): resistance, gripping and weathering, as on the
// other knights.
// Mutations (Anathema) don't persist across logins and use their own
// anathema balance ("You may wield the Chaotic forces once again."):
// mouths (0.5% karma; Shriek, Dread and Entropy need it) and bulk (0.5%
// karma; +1 strength, minor cutting and blunt resistance) are left to
// curing at DEFCON 3, since each raise costs karma. DEF names unconfirmed;
// if curing doesn't raise them, they move to DEFCON UP.
D.classes["Unnamable"] = {
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
    ["resistance", 4, 10],
    ["gripping", 4, 12],
    ["weathering", 4, 12],
    ["mouths", 3, 10],
    ["bulk", 3, 12]
  ]
};
