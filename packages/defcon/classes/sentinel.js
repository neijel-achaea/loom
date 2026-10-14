// Sentinel: DEFCON UP commands and defences. See classes/README.md.
// Skills: Metamorphosis, Woodlore, Skirmishing.
// DEFCON UP embraces the spirit (less endurance loss in every spirit form),
// then morphs into a jaguar, both on equilibrium. The morph is last because
// anything sent while morphing breaks it; if it doesn't take, morph by hand.
// Free once up (DEFCON 4): barkskin (200 mana once, physical protection),
// firstaid (wounds clot faster) and fleetness (faster through forests).
D.classes["Sentinel"] = {
  up: ["queue add eq embrace spirit", "queue add eq morph jaguar"],
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
    ["barkskin", 4, 10],
    ["firstaid", 4, 12],
    ["fleetness", 4, 14]
  ]
};
