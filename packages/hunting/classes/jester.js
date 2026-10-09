// Jester: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Noogie 16s,
// Ensconce 23s, Befuddle 23s, Dustthrow 25s, Rap 33s, Provoke 20s.
// Class conditions: none in charstats.
HU.classes["Jester"] = {
  keys: [
    ["Bop", "queue add b!wu!t!p bop @tar", "main"],
    ["Noogie", huQ + "noogie @tar"],
    ["Ensconce", huQ + "ensconce firecracker on @tar"],
    ["Jacks", huQ + "throw jacks at @tar"],
    ["Befuddle", huQ + "befuddle @tar"],
    ["Dustthrow", huQ + "dustthrow @tar"],
    ["Rap", huQ + "rap @tar"],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["", ""],
    ["Shield", "touch shield"]
  ],
  rage: { Noogie: 14, Ensconce: 36, Jacks: 17, Befuddle: 25, Dustthrow: 18, Rap: 26, Provoke: 32 },
  // To capture (#31): Bop; Noogie; Ensconce; Jacks (on a shielded target);
  // Befuddle, plain and BEFUDDLE++ (target in aeon or amnesiac); Dustthrow;
  // Rap; Provoke.
  lines: [
  ]
};
