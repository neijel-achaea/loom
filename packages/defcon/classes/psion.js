// Psion: defences. See classes/README.md. Skills: Weaving, Psionics,
// Emulation. Nothing is sent on DEFCON INIT (WEAVE PREPARE lasts until
// changed).
// Free once up (DEFCON 4): secondskin (WEAVE SECONDSKIN, resists every
// damage type) and guidedstrike (ENACT GUIDEDSTRIKE, bigger critical hits).
// Indomitability is a hunting panic key (F11): its images run out, so
// curing would keep re-casting it.
D.classes["Psion"] = {
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
    ["secondskin", 4, 10],
    ["guidedstrike", 4, 12]
  ]
};
