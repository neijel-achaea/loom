// Paladin: defences. See classes/README.md. Skills: Weaponmastery,
// Excision, Valour. Nothing is sent on DEFCON INIT.
// Free once up (DEFCON 4): faith (resists cutting, blunt and some magic),
// unbowed (a health surge when badly hurt, can stop one killing blow),
// resistance (less magic damage), gripping and weathering (+1 con).
// The Rite of Regeneration is a hunting key (F11). Fury stays out (500
// willpower per re-enable).
D.classes["Paladin"] = {
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
    ["faith", 4, 10],
    ["unbowed", 4, 11],
    ["resistance", 4, 10],
    ["gripping", 4, 12],
    ["weathering", 4, 12]
  ]
};
