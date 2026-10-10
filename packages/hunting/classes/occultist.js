// Occultist: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Harry 16s,
// Chaosgate 23s, Fluctuate 23s, Temperance 43s, Stagnate 35s, Provoke 20s.
// Class conditions (charstats, for self): Karma, Entity (Yes/No).
HU.classes["Occultist"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    warp: ["Warp", "queue add e!wu!t!p warp @tar"]
  },
  keys: [
    ["{main}", ""],
    ["Harry", huQ + "harry @tar"],
    ["Chaosgate", huQ + "chaosgate @tar"],
    ["Ruin", huQ + "ruin @tar"],
    ["Fluctuate", huQ + "fluctuate @tar"],
    ["Temperance", huQ + "temper @tar"],
    ["Stagnate", huQ + "stagnate @tar"],
    ["{toggle:sneak}", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["", ""],
    ["Shield", "touch shield"]
  ],
  // Sneak: SHROUD / UNSHROUD.
  toggles: {
    sneak: { label: "Sneak", on: ["shroud"], off: ["unshroud"] }
  },
  rage: { Harry: 14, Chaosgate: 36, Ruin: 17, Fluctuate: 25, Temperance: 32, Stagnate: 24, Provoke: 32 },
  // To capture (#31): Warp; Harry; Chaosgate; Ruin (on a shielded target);
  // Fluctuate, plain and FLUCTUATE++ (target afraid or amnesiac); Temperance;
  // Stagnate; Provoke. Check the name in "You can use ... again" for
  // Temperance (typed TEMPER).
  lines: [
  ]
};
