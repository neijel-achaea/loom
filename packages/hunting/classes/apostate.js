// Apostate: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Convulsions 16s,
// Burrow 23s, Bloodlet 23s, Possess 43s, Horrify 34s, Provoke 20s.
// Class condition (charstats, for self): Essence.
HU.classes["Apostate"] = {
  keys: [
    ["Bleed", "queue add b!wu!t!p deadeyes @tar bleed bleed", "main"],
    ["Convulsions", huQ + "stare @tar convulsions"],
    ["Burrow", huQ + "daegger burrow @tar"],
    ["Pierce", huQ + "daegger pierce @tar"],
    ["Bloodlet", huQ + "bloodlet @tar"],
    ["Possess", huQ + "possess @tar"],
    ["", ""],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Horrify", huQ + "stare @tar horrify"],
    ["Shield", "touch shield"]
  ],
  rage: { Convulsions: 14, Burrow: 36, Pierce: 17, Bloodlet: 25, Possess: 32, Horrify: 29, Provoke: 32 },
  // To capture (#31): Bleed (deadeyes); Convulsions; Burrow; Pierce (on a
  // shielded target); Bloodlet, plain and BLOODLET++ (target sensitive or
  // stunned); Possess; Horrify; Provoke.
  lines: [
  ]
};
