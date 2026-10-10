// Priest: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Torment 16s,
// Desolation 23s, Hammer 23s, Incense 19s, Horrify 34s, Provoke 20s.
// Class conditions (charstats, for self): Angelpower, Devotion, conviction,
// prayer_length, Prayer (Yes/No).
HU.classes["Priest"] = {
  keys: [
    ["Smite", "queue add b!wu!t!p smite @tar", "main"],
    ["Torment", huQ + "angel torment @tar"],
    ["Desolation", huQ + "perform rite of desolation on @tar"],
    ["Crack", huQ + "crack @tar"],
    ["Hammer", huQ + "hammer @tar"],
    ["Incense", huQ + "angel incense @tar"],
    ["", ""],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Horrify", huQ + "perform rite of horrify on @tar"],
    ["Shield", "touch shield"]
  ],
  rage: { Torment: 14, Desolation: 36, Crack: 17, Hammer: 25, Incense: 18, Horrify: 29, Provoke: 32 },
  // To capture (#31): Smite; Torment; Desolation; Crack (on a shielded
  // target); Hammer, plain and HAMMER++ (target clumsy or amnesiac); Incense;
  // Horrify; Provoke. Check the names in "You can use ... again" for the
  // rites.
  lines: [
  ]
};
