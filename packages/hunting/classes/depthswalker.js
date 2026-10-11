// Depthswalker: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Drain 16s,
// Lash 23s, Erasure 23s, Curse 35s, Boinad 38s, Provoke 20s.
// Class conditions (charstats, for self): Word (Yes/No), Age.
HU.classes["Depthswalker"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    cull: ["Cull", "queue add b!wu!t!p shadow cull @tar"]
  },
  keys: [
    // Cull takes balance (checked in game, #31).
    ["{main}", ""],
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
  // Past level 35 (#149): Nakail (needs Terminus, level 50; on a shielded
  // target); Erasure, plain and ERASURE++ (target weakened or amnesiac);
  // Boinad.
  lines: [
    [/^You lay into (.*) with a vicious blow from a scythe of shadows\.$/, "CULL"],
    [/^You command the shadow of (.*) to begin siphoning away the life of its host\.$/, "DRAIN", "Drain"],
    [/^You summon whips of shadow to viciously lash the form of (.*)\.$/, "LASH", "Lash"],
    [/^Bending your formidable will upon (.*), you slow the passage of time about (\w+) to a crawl\.$/, "CURSE", "Curse"]
  ]
};
