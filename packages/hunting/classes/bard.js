// Bard: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Moulinet 16s,
// Howlslash 23s, Cyclone 23s, Trill 41s, Charm 43s, Provoke 20s.
// Class condition (charstats, for self): Voice (Yes/No).
HU.classes["Bard"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    jab: ["Jab", "queue add b!wu!t!p blade jab @tar torso"]
  },
  keys: [
    ["{main}", ""],
    ["Moulinet", huQ + "moulinet @tar"],
    ["Howlslash", huQ + "howlslash @tar"],
    ["Resonance", huQ + "play resonance at @tar"],
    ["Cyclone", huQ + "cyclone @tar"],
    ["Trill", huQ + "play trill at @tar"],
    ["Charm", huQ + "play charm at @tar"],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["", ""],
    ["Shield", "touch shield"]
  ],
  rage: { Moulinet: 14, Howlslash: 36, Resonance: 17, Cyclone: 25, Trill: 28, Charm: 32, Provoke: 32 },
  // To capture (#31): Jab; Moulinet; Howlslash; Resonance (on a shielded
  // target); Cyclone, plain and CYCLONE++ (target clumsy or stunned); Trill;
  // Charm; Provoke.
  lines: [
  ]
};
