// Priest: DEFCON UP commands and defences. See classes/README.md.
// Skills: Spirituality, Devotion, Zeal (after embracing).
// DEFCON UP summons the angel (equilibrium), then summons and wields the
// spiritual mace (balance), in that order.
// Angel care heals your afflictions but drains angel power: DEFCON 1,
// switched off (ANGEL CARE OFF) below. DEF name "care" unconfirmed.
// Not kept: angel aura (drops when you move or attack, like the shield
// tattoo), inspiration (short and costly), the room rites. The Zeal
// blessings are suggestions until confirmed after embracing.
D.classes["Priest"] = {
  up: ["queue add eq angel summon", "queue add bal summon mace", "queue add bal wield mace"],
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
    ["care", 1, 13, "angel care off"]
  ]
};
