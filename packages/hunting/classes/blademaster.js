// Blademaster: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Leapstrike 16s,
// Spinslash 23s, Headstrike 23s, Daze 33s, Nerveslash 31s, Provoke 20s.
// Class conditions (charstats, for self): Shin, Stance.
HU.classes["Blademaster"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    drawslash: ["Drawslash", "queue add b!wu!t!p drawslash @tar sternum"],
    // Three strikes in one (Ricardo, 2026-10-20). HUNTING MAIN MULTISLASH.
    multislash: ["Multislash", "queue add b!wu!t!p multislash @tar"]
  },
  keys: [
    ["{main}", ""],
    ["Leapstrike", huQ + "leapstrike @tar"],
    ["Spinslash", huQ + "spinslash @tar"],
    ["Shatter", huQ + "shin shatter @tar"],
    ["Headstrike", huQ + "strike @tar head"],
    ["Daze", huQ + "shin daze @tar"],
    ["Nerveslash", huQ + "nerveslash @tar"],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["", ""],
    ["Shield", "touch shield"]
  ],
  rage: { Leapstrike: 14, Spinslash: 36, Shatter: 17, Headstrike: 25, Daze: 26, Nerveslash: 22, Provoke: 32 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Shatter"],
  // Past level 35 (#149): Headstrike, plain and HEADSTRIKE++ (target
  // reckless or afraid); Nerveslash.
  lines: [
    [/^With expert precision, you draw (.*) from its scabbard and unleash a vicious slash towards (.*)\.$/, "DRAWSLASH"],
    [/^With masterful technique, you draw (.*) from its scabbard and unleash three precise strikes towards (.*)\.$/, "MULTISLASH"],
    [/^A Shin-enhanced leap flings you high into the air\.$/, "LEAPSTRIKE", "Leapstrike"],
    [/^You hurl a precise blast of Shin energy at (.*)'s eyes\.$/, "DAZE", "Daze"],
    [/^You unleash a burst of Shin energy at (.*), tearing apart (\w+) translucent shield\.$/, "SHATTER", "Shatter"],
    [/^You twist in a tight circle, slashing (.*) with each spin\.$/, "SPINSLASH", "Spinslash"]
  ]
};
