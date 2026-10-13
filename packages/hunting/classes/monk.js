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
    ["{toggle:block}", ""],
    ["Shield", "touch shield"]
  ],
  // F11: Bodyblock. The game's own lines keep the key right, however it was
  // switched.
  toggles: {
    block: { label: "Block", on: ["bdb"], off: ["unblock bdb"],
             seen: [/^You ready yourself to block as best you can\.$/, /^You lower your body block\.$/] }
  },
  // Tekura gradings: the tutor's demonstration breaks if anything else is
  // sent, so triggers pause, "ok" starts it, and the new belt resumes them.
  pauses: [
    [/offers you a formal grading\. Type "OK" to commence the demonstration\.$/,
     /confers on you the right to wear the \w+ belt\.$/, "ok"]
  ],
  // "You connect!" follows every hit of a combo; a miss says so instead.
  gags: [/^You connect!$/],
  rage: { Spinningbackfist: 14, Tornadokick: 36, Splinterkick: 17, Mindblast: 25, Scramble: 22, Ripplestrike: 25, Provoke: 32 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Splinterkick"],
  // Past level 35 (#149): Mindblast, plain and MINDBLAST++ (target weakened
  // or sensitive); Ripplestrike.
  lines: [
    [/^You pump out at (.*) with a powerful side kick\.$/, "SDK"],
    [/^You launch a powerful uppercut at (.*)\.$/, "UCP"],
    [/^You spin and strike (.*) with the back of your fist\.$/, "SBP", "Spinningbackfist"],
    [/^You leap and spin in the air, striking (.*) repeatedly with an outstretched foot\.$/, "TNK", "Tornadokick"],
    [/^You focus your rage in a single powerful sidekick, shattering (.*)'s translucent shield\.$/, "SPK", "Splinterkick"],
    [/^You rummage quickly through (.*)'s mind, finding the link to fine motor control before exerting a small amount of psychic force and deadening it\.$/, "SCRAMBLE", "Scramble"]
  ]
};
