// Depthswalker: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Drain 16s,
// Lash 23s, Erasure 23s, Curse 35s, Boinad 38s, Provoke 20s.
// Class conditions (charstats, for self): Word (Yes/No), Age.
HU.classes["Depthswalker"] = {
  keys: [
    // Cull: the help doesn't say bal or eq, so it waits for both until #31
    // shows which one it uses.
    ["Cull", "queue add eb!wu!t!p shadow cull @tar", "main"],
    ["Drain", huQ + "shadow drain @tar"],
    ["Lash", huQ + "shadow lash @tar"],
    ["Nakail", huQ + "intone nakail @tar"],
    ["Erasure", huQ + "chrono erasure @tar"],
    ["Curse", huQ + "chrono curse @tar"],
    ["Boinad", huQ + "intone boinad @tar"],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["", ""],
    ["Shield", "touch shield"]
  ],
  rage: { Drain: 14, Lash: 36, Nakail: 17, Erasure: 25, Curse: 24, Boinad: 32, Provoke: 32 },
  // To capture (#31): Cull (and which balance it takes); Drain; Lash; Nakail
  // (on a shielded target); Erasure, plain and ERASURE++ (target weakened or
  // amnesiac); Curse; Boinad; Provoke.
  lines: [
  ]
};
