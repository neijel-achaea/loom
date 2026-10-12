// Pariah: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Boil 16s,
// Feast 23s, Spider 23s, Wail 38s, Symphony 35s, Provoke 20s.
// Class condition (charstats, for self): epitaph_length.
HU.classes["Pariah"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    wrack: ["Wrack", "queue add b!wu!t!p blood wrack @tar"]
  },
  keys: [
    ["{main}", ""],
    ["Boil", huQ + "blood boil @tar"],
    ["Feast", huQ + "swarm feast @tar"],
    ["Scour", huQ + "accursed scour @tar"],
    ["Spider", huQ + "trace spider @tar"],
    ["Wail", huQ + "accursed wail @tar"],
    ["", ""],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Symphony", huQ + "swarm symphony @tar"],
    ["Shield", "touch shield"]
  ],
  rage: { Boil: 14, Feast: 36, Scour: 17, Spider: 25, Wail: 32, Symphony: 24, Provoke: 32 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Scour"],
  // Past level 35 (#149): Spider, plain and SPIDER++ (target inhibited or
  // sensitive); Wail.
  lines: [
    [/^You raise your (?:left|right) hand before (.*), and clench it into a fist as you wrack the blood that flows throughout\.$/, "WRACK"],
    [/^You reach out and claw at the air, heating the body of (.*) from within\.$/, "BOIL", "Boil"],
    [/^You croon to the myriad minds that surround you, and send them to feast upon (.*) in a wave of chittering hunger\.$/, "FEAST", "Feast"],
    [/^You flick your hand towards (.*), and a sheet of sand rises to scour the magical shield surrounding (\w+)\.$/, "SCOUR", "Scour"],
    // Symphony: matched on its opening, as the target's reaction follows.
    [/^You tilt back your head and raise your voice in humming symphony with the myriad minds that crawl and fly\./, "SYMPHONY", "Symphony"]
  ]
};
