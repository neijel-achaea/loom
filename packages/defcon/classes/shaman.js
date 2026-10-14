// Shaman: defences. See classes/README.md. Skills: Vodun, Curses,
// Spiritlore. Nothing is sent on DEFCON UP: spirit bonds and attunements
// last until changed.
// Free once up (DEFCON 4): gripping, and the invocations regeneration
// (Ri'shen, 300 mana once) and purification (Daina, 200 mana once), which
// need that spirit bound. Their DEF names are unconfirmed.
// Arrowcatching (mana drain) is a suggestion; swiftcurse is used up after
// ten curses, so curing can't keep it.
D.classes["Shaman"] = {
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
    ["gripping", 4, 12],
    ["regeneration", 4, 11],
    ["purification", 4, 13]
  ]
};
