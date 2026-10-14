// Blademaster: DEFCON INIT commands and defences. See classes/README.md.
// DEFCON INIT positions the scabbard (the First Art needs it, every login),
// enters the Shin trance and takes the Doya stance, on the balance queue.
// Defaults: the generic defences plus gripping and toughness. Unconfirmed
// Shindo and Striking defences are suggestions in classes/README.md.
D.classes["Blademaster"] = {
  init: ["queue add bal position scabbard", "queue add bal shin trance", "queue add bal doya"],
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
    ["toughness", 4, 10]
  ]
};
