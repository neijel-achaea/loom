// Sentinel: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Pester 16s,
// Skewer 23s, Swarm 23s, Tame 43s, Goad 19s, Provoke 20s.
// Class condition (charstats, for self): Morph.
HU.classes["Sentinel"] = {
  // Main attacks for F1, following the morph; HUNTING MAIN picks another,
  // and adds more in game.
  mains: {
    bite: ["Bite", "queue add b!wu!t!p bite @tar"],
    claw: ["Claw", "queue add b!wu!t!p claw @tar"],
    maul: ["Maul", "queue add b!wu!t!p maul @tar"]
  },
  morphMain: { "Wolf": "bite", "Hyena": "claw", "Jaguar": "maul" },
  keys: [
    ["{main}", ""],
    ["Pester", huQ + "pester @tar"],
    ["Skewer", huQ + "skewer @tar"],
    ["Bore", huQ + "bore @tar"],
    ["Swarm", huQ + "swarm @tar"],
    ["Tame", huQ + "tame @tar"],
    ["Goad", huQ + "goad @tar"],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["", ""],
    ["Shield", "touch shield"]
  ],
  // Morphing breaks if anything is sent: pause from the call to the spirits
  // until the transformation (or the Morph change in charstats).
  pauses: [
    [/^You throw your arms wide and a cry rings out from your lips, a clarion call to the ancient spirits of nature to taste the joy of life once more\.$/,
     /^You are surrounded by a shining corona of blinding light as your soul is transformed by metamorphosis\.$/]
  ],
  rage: { Pester: 14, Skewer: 36, Bore: 17, Swarm: 25, Tame: 32, Goad: 18, Provoke: 32 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Bore"],
  // To capture (#31): Bite, Claw and Maul; Pester; Skewer; Bore (on a
  // shielded target); Swarm, plain and SWARM++ (target in aeon or
  // inhibited); Tame; Goad.
  lines: [
  ]
};
