// Depthswalker: DEFCON UP commands and defences. See classes/README.md.
// No DEFCON UP commands: the shadow cloak (worn; tah'maal needs it) and the
// manifested scythe both stay between sessions, and the game says when the
// cloak decays.
// The Terminus intonements (word balance, after embracing) are free once up:
// tsuura (less damage from denizens), mainaas (cutting and blunt
// resistance), tah'maal (fire resistance, over the cloak) and trusad (more
// critical hits on denizens). Their DEF names are unconfirmed until the
// alt learns Terminus.
// Not kept: kail (a hunting panic key, F11), ukhia, instill (for PvP),
// veil (to look at once learned); Aeonics spends age in the moment.
D.classes["Depthswalker"] = {
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
    ["tsuura", 4, 10],
    ["mainaas", 4, 11],
    ["tahmaal", 4, 12],
    ["trusad", 4, 13]
  ]
};
