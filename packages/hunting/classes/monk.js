// Monk: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them):
// Spinningbackfist 16s, Tornadokick 23s, Mindblast 23s, Scramble 31s,
// Ripplestrike 27s, Provoke 20s.
// Class conditions (charstats, for self): Kai, Stance.
HU.classes["Monk"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    combo: ["Combo", "queue add b!wu!t!p combo @tar sdk ucp ucp"]
  },
  keys: [
    // One combo on one balance: sidekick, uppercut, uppercut (Eagle Stance).
    // Syntax still to confirm in game.
    ["{main}", ""],
    ["SBP", huQ + "sbp @tar", "Spinningbackfist"],
    ["TNK", huQ + "tnk @tar", "Tornadokick"],
    ["SPK", huQ + "spk @tar", "Splinterkick"],
    ["Mindblast", huQ + "mind blast @tar"],
    ["Scramble", huQ + "mind scramble @tar"],
    ["RPST", huQ + "rpst @tar", "Ripplestrike"],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["", ""],
    ["Shield", "touch shield"]
  ],
  rage: { Spinningbackfist: 14, Tornadokick: 36, Splinterkick: 17, Mindblast: 25, Scramble: 22, Ripplestrike: 25, Provoke: 32 },
  // To capture (#31): the combo's three lines (sidekick, uppercut, uppercut;
  // each can be tagged on its own); Spinningbackfist; Tornadokick;
  // Splinterkick (on a shielded target); Mindblast, plain and MINDBLAST++
  // (target weakened or sensitive); Scramble; Ripplestrike; Provoke. Check
  // the names in "You can use ... again" (Mindblast is typed MIND BLAST).
  lines: [
  ]
};
