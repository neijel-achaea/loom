// Psion: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Barbedblade
// 16s, Devastate 23s, Whirlwind 23s, Regrowth 35s, Terror 38s, Provoke 20s.
// Class conditions: none in charstats.
HU.classes["Psion"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    overhand: ["Overhand", "queue add b!wu!t!p weave overhand @tar"]
  },
  keys: [
    // Overhand: learnt early. Charge and later Deathblow are the other main
    // attacks; their lines are kept below so either one shows when used.
    ["{main}", ""],
    ["Barbedblade", huQ + "weave barbedblade @tar"],
    ["Devastate", huQ + "psi devastate @tar"],
    ["Pulverise", huQ + "weave pulverise @tar"],
    ["Whirlwind", huQ + "weave whirlwind @tar"],
    ["Regrowth", huQ + "enact regrowth @tar"],
    ["", ""],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Terror", huQ + "psi terror @tar"],
    ["Shield", "touch shield"]
  ],
  rage: { Barbedblade: 14, Devastate: 36, Pulverise: 17, Whirlwind: 25, Regrowth: 24, Terror: 32, Provoke: 32 },
  // Still to capture (#31): Overhand; Pulverise (on a shielded target);
  // Whirlwind, plain and WHIRLWIND++ (target inhibited or stunned);
  // Regrowth; Terror; Provoke.
  // Charge, Barbedblade and Devastate come from Ricardo's pre-Loom package.
  lines: [
    [/^Charging forward, you drive a translucent spear into (.*)\.$/, "CHARGE"],
    [/^You weave a jagged blade into being and viciously hack at (.*), opening bleeding wounds\.$/, "BARBEDBLADE", "Barbedblade"],
    [/^You hammer the mind of (.*) with a devastating psionic onslaught\.$/, "DEVASTATE", "Devastate"]
  ]
};
