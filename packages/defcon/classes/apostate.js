// Apostate: DEFCON UP commands and defences. See classes/README.md.
// DEFCON UP summons the Baalzadeen first (demon armour needs it), then the
// daegger, masks the Baalzadeen and wields the daegger. Everything waits for
// equilibrium in order, so the wield comes after the summon.
// Demon armour costs the Baalzadeen 300 health, lifevision 600 mana once:
// neither drains, so both are kept from DEFCON 4. Lifevision mostly guards
// against adventurers (thieves), but costs nothing to keep up.
D.classes["Apostate"] = {
  up: ["queue add eq summon baalzadeen", "queue add eq summon daegger", "queue add eq mask", "queue add eq wield daegger"],
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
    ["demonarmour", 4, 10],
    ["lifevision", 4, 13]
  ]
};
