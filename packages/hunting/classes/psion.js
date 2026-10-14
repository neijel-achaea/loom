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
    // Terror on F7, where it's shown by default (#114); F11 is the panic key.
    ["Terror", huQ + "psi terror @tar"],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    // Indomitability: images that each soak three hits (equilibrium). A
    // panic key: curing would keep re-casting it as they run out (#156).
    ["Indomitability", "queue add e!wu!t!p enact indomitability"],
    ["Shield", "touch shield"]
  ],
  rage: { Barbedblade: 14, Devastate: 36, Pulverise: 17, Whirlwind: 25, Regrowth: 24, Terror: 32, Provoke: 32 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Pulverise"],
  // Past level 35 (#149): Whirlwind, plain and WHIRLWIND++ (target inhibited
  // or stunned); Terror.
  // Charge, Barbedblade and Devastate come from Ricardo's pre-Loom package.
  lines: [
    [/^You bring (.*) around in a savage overhand strike, smashing it into the face of (.*)\.$/, "OVERHAND"],
    [/^You weave a great warhammer into being and with an overhand swing obliterate the magical shield surrounding (.*)\.$/, "PULVERISE", "Pulverise"],
    [/^You direct nature to restrain (.*), and vines flash from nothingness into being to bind (\w+)\.$/, "REGROWTH", "Regrowth"],
    [/^Charging forward, you drive a translucent spear into (.*)\.$/, "CHARGE"],
    [/^You weave a jagged blade into being and viciously hack at (.*), opening bleeding wounds\.$/, "BARBEDBLADE", "Barbedblade"],
    [/^You hammer the mind of (.*) with a devastating psionic onslaught\.$/, "DEVASTATE", "Devastate"]
  ]
};
