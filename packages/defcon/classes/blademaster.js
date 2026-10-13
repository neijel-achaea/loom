// Blademaster: DEFCON UP commands and defences. See classes/README.md.
// DEFCON UP positions the scabbard (the First Art needs it, every login),
// enters the Shin trance (Shin abilities and binding's healing need it) and
// takes the Doya stance; all on the balance queue, in that order.
// Free once up (DEFCON 4): gripping, toughness, constitution, consciousness,
// clarity (650 mana once) and binding (300 mana once). Projectiles, dodging
// and mindnet drain mana: DEFCON 1, relaxed below.
// Not kept: sturdiness, immunity and breathing end on your next action;
// perfection, block and engage only work against adventurers and cost Shin
// or mana; retaliationstrike is toggled by hand.
D.classes["Blademaster"] = {
  up: ["queue add bal position scabbard", "queue add bal shin trance", "queue add bal doya"],
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
    ["toughness", 4, 10],
    ["constitution", 4, 13],
    ["consciousness", 4, 12],
    ["clarity", 4, 13],
    ["binding", 4, 11],
    ["projectiles", 1, 14, true],
    ["dodging", 1, 15, true],
    ["mindnet", 1, 15, true]
  ]
};
