// Blademaster: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Leapstrike 16s,
// Spinslash 23s, Headstrike 23s, Daze 33s, Nerveslash 31s, Provoke 20s.
// Class conditions (charstats, for self): Shin, Stance.
HU.classes["Blademaster"] = {
  keys: [
    ["Drawslash", "queue add b!wu!t!p drawslash @tar sternum", "main"],
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
  // To capture (#31): Drawslash (check that STERNUM works); Leapstrike; Spinslash; Shatter (on a
  // shielded target); Headstrike, plain and HEADSTRIKE++ (target reckless or
  // afraid); Daze; Nerveslash; Provoke. Also check the name the game uses in
  // "You can use ... again" for Headstrike (typed as STRIKE HEAD).
  lines: [
  ]
};
