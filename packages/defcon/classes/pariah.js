// Pariah: DEFCON UP commands and defences. See classes/README.md.
// Skills: Memorium, Pestilence, Charnel (after embracing).
// DEFCON UP lets your own blood onto the ritual blade (CRUX LET ME) on
// equilibrium. Swarms persist, so nothing else is sent.
// Free once up (DEFCON 4): shieldlogograph (TRACE SHIELD ME, damage
// resistance by intelligence) and leechlogograph (TRACE LEECH ME, draws
// out afflictions for five minutes). Resolve is a suggestion.
D.classes["Pariah"] = {
  up: ["queue add eq crux let me"],
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
    ["shieldlogograph", 4, 10],
    ["leechlogograph", 4, 12]
  ]
};
