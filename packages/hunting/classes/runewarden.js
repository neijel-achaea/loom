// Runewarden: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Collide 16s,
// Onslaught 23s, Etch 23s, Safeguard 57s, Bulwark 45s, Provoke 20s.
// Class conditions (charstats, for self): Ferocity, empower, Spec.
HU.classes["Runewarden"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game. The
  // default follows the specialisation (specMain); other specs to add.
  mains: {
    combination: ["Combo", "queue add b!wu!t!p combination @tar rend smash"]
  },
  specMain: { "Sword and Shield": "combination" },
  keys: [
    ["{main}", ""],
    ["Collide", huQ + "collide @tar"],
    ["Onslaught", huQ + "onslaught @tar"],
    // Raze: the balance shieldbreak (no rage). Fragment is the rage one,
    // tracked but without a key.
    ["Raze", "queue add b!wu!t!p raze @tar"],
    ["Etch", huQ + "etch rune at @tar"],
    ["Safeguard", huQ + "safeguard {target}"],
    ["", ""],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Bulwark", huQ + "bulwark"],
    ["Shield", "touch shield"]
  ],
  rage: { Collide: 14, Onslaught: 36, Fragment: 17, Etch: 25, Safeguard: 35, Bulwark: 28, Provoke: 32 },
  // To capture (#31): the combination's lines (rend, smash); Collide;
  // Onslaught; Raze and Fragment (on a shielded target); Etch, plain and
  // ETCH++ (target in aeon or stunned); Safeguard; Bulwark; Provoke. The
  // other specs' main attacks, when tested.
  lines: [
  ]
};
