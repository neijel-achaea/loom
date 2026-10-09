// Alchemist: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Miasma 16s,
// Magnesium 23s, Pathogen 23s, Cadmium 31s, Hypnotic 41s, Provoke 20s.
HU.classes["Alchemist"] = {
  keys: [
    ["Iron", "queue add e!wu!t!p educe iron @tar", "main"],
    ["Miasma", huQ + "throw miasma at @tar"],
    ["Magnesium", huQ + "educe magnesium @tar"],
    ["Caustic", huQ + "throw caustic at @tar"],
    ["Pathogen", huQ + "throw pathogen at @tar"],
    ["Cadmium", huQ + "educe cadmium @tar"],
    ["Hypnotic", huQ + "throw hypnotic at @tar"],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["", ""],
    ["Shield", "touch shield"]
  ],
  rage: { Miasma: 14, Magnesium: 36, Caustic: 17, Pathogen: 25, Cadmium: 22, Hypnotic: 28, Provoke: 32 },
  // To capture (#31): Iron; Miasma; Magnesium; Caustic (on a shielded
  // target); Pathogen, plain and PATHOGEN++ (target inhibited or afraid);
  // Cadmium; Hypnotic; Provoke.
  lines: [
  ]
};
