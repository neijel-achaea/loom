// Infernal: DEFCON UP commands and defences. See classes/README.md.
// Skills: Oppression, Malignity, Weaponmastery.
// DEFCON UP activates Relentless (fear immunity) and channels Conqueror
// (heals on kills) in the hellforged armour, on the balance queue. Untested:
// whether these persist across logins (then they can leave UP), and the
// second channel slot is left free.
// Resistance (less magic damage) and gripping are free once up: DEFCON 4.
// Not kept: fury (free once a day, then 500 willpower per re-enable, and
// heavy endurance loss; a DEFCON 1 candidate later), soulshield (a
// battlerage key, F11), sturdiness (ends on your next action), clot (a
// cure), deathaura and defend/engage/block (PvP).
D.classes["Infernal"] = {
  up: ["queue add bal hellforge activate relentless", "queue add bal hellforge channel conqueror"],
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
    ["resistance", 4, 10],
    ["gripping", 4, 12]
  ]
};
