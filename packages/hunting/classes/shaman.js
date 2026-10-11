// Shaman: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Corruption 16s,
// Haemorrhage 23s, Vurus 23s, Cesaret 19s, Korkma 34s, Provoke 20s.
// Class condition (charstats, for self): Spirits.
HU.classes["Shaman"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    bleed: ["Bleed", "queue add b!wu!t!p curse @tar bleed"]
  },
  keys: [
    ["{main}", ""],
    ["Corruption", huQ + "curse @tar corruption"],
    ["Haemorrhage", huQ + "curse @tar haemorrhage"],
    ["Vulnerability", huQ + "curse @tar vulnerability"],
    ["Vurus", huQ + "invoke vurus @tar"],
    ["Cesaret", huQ + "invoke cesaret @tar"],
    ["", ""],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Korkma", huQ + "invoke korkma @tar"],
    ["Shield", "touch shield"]
  ],
  rage: { Corruption: 14, Haemorrhage: 36, Vulnerability: 17, Vurus: 25, Cesaret: 18, Korkma: 29, Provoke: 32 },
  // To capture (#31): Bleed; Corruption; Haemorrhage; Vulnerability (on a
  // shielded target); Vurus, plain and VURUS++ (target sensitive or
  // amnesiac); Cesaret; Korkma. Check the names in "You can use ...
  // again" for the curses.
  lines: [
  ]
};
