// Sentinel: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Pester 16s,
// Skewer 23s, Swarm 23s, Tame 43s, Goad 19s, Provoke 20s.
// Class condition (charstats, for self): Morph.
HU.classes["Sentinel"] = {
  // Main attacks for F1. Doublestrike is the default, morphed or not
  // (#150 testing); without it learned, HUNTING MAIN BITE, CLAW or MAUL
  // once and that's remembered. HUNTING MAIN x = cmd adds more in game.
  mains: {
    // First, so it's the default.
    doublestrike: ["Doublestrike", "queue add b!wu!t!p doublestrike @tar"],
    bite: ["Bite", "queue add b!wu!t!p bite @tar"],
    claw: ["Claw", "queue add b!wu!t!p claw @tar"],
    maul: ["Maul", "queue add b!wu!t!p maul @tar"]
  },
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
  // For #149: SWARM++ (target in aeon or inhibited).
  // Weapons, pronouns and the pestering animal are left open. Swarm matches
  // on its opening, so SWARM++ counts too.
  lines: [
    // Doublestrike's two hits: the slice, then the haft.
    [/^You lay open the flesh of (.*) with an expert lateral slice with (.*)\.$/, "DOUBLESTRIKE"],
    [/^Turning with the motion of your strike, you come back around and slam the haft of your weapon into the temple of (.*)\.$/, "DOUBLESTRIKE"],
    [/^You sink your teeth deep into (.*), who howls in pain\.$/, "BITE"],
    [/^You strike brutally at (.*), and shred (\w+) skin\.$/, "CLAW"],
    [/^You spring forwards onto (.*), and maul (\w+) viciously\.$/, "MAUL"],
    [/^(.*) continues to pester (.*), continually biting (\w+)\.$/, "PESTER", "Pester"],
    [/^You leap high into the air, (.*) held high above your head as you land on top of (.*), skewering (\w+) with your weapon\.$/, "SKEWER", "Skewer"],
    [/^You thrust forward with (.*), piercing through (.*)'s shield\.$/, "BORE", "Bore"],
    [/^You utter a loud, buzzing call, and a swarm of wasps rushes in/, "SWARM", "Swarm"],
    [/^Making soothing noises, you carefully approach (.*), assuring (\w+) that you are a friend and urging (\w+) to fight for you\.$/, "TAME", "Tame"],
    [/^You cower before (.*), causing (\w+) to recklessly attack you with no regard for (\w+) own safety\.$/, "GOAD", "Goad"]
  ]
};
