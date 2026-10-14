// Runewarden: defences. See classes/README.md. Skills: Weaponmastery,
// Runelore, Discipline. Nothing is sent on DEFCON INIT.
// Free once up (DEFCON 4): resistance (less magic damage), gripping and
// weathering (+1 constitution), as on the other knights.
// Runes sketched on yourself (algiz, jera, berkana) don't show in DEF, so
// curing can't keep them; fury stays out (500 willpower per re-enable).
// Bulwark is a battlerage key (F11).
D.classes["Runewarden"] = {
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
    ["resistance", 4, 10],
    ["gripping", 4, 12],
    ["weathering", 4, 12]
  ]
};
