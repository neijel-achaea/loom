// Jester: defences. See classes/README.md. Skills: Pranks, Tarot,
// Puppetry. Nothing is sent on DEFCON INIT (the blackjack stays wielded).
// Slipperiness (no ongoing cost) and gripping at DEFCON 4; acrobatics
// (endurance) and balancing (mana) only at 1, relaxed below. Arrowcatch is
// a suggestion in classes/README.md. Fool is a hunting key (F11).
D.classes["Jester"] = {
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
    ["slipperiness", 4, 10],
    ["gripping", 4, 12],
    ["acrobatics", 1, 11, true],
    ["balancing", 1, 14, true]
  ]
};
