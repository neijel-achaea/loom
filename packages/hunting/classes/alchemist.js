// Alchemist: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Miasma 16s,
// Magnesium 23s, Pathogen 23s, Cadmium 31s, Hypnotic 41s, Provoke 20s.
HU.classes["Alchemist"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    iron: ["Iron", "queue add e!wu!t!p educe iron @tar"]
  },
  keys: [
    ["{main}", ""],
    ["Miasma", huQ + "throw miasma at @tar"],
    ["Magnesium", huQ + "educe magnesium @tar"],
    // Copper: the equilibrium shieldbreak (no rage). Caustic is the rage
    // one, tracked but without a key. Lit whenever you have balance and
    // equilibrium, like Iron.
    ["Copper", "queue add e!wu!t!p educe copper @tar", "main"],
    ["Pathogen", huQ + "throw pathogen at @tar"],
    ["Cadmium", huQ + "educe cadmium @tar"],
    ["Hypnotic", huQ + "throw hypnotic at @tar"],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    // Tin: reflects part of the next two attacks' damage (500 mana). A
    // panic key, not kept up by DEFCON.
    ["Tin", "queue add e!wu!t!p educe tin"],
    ["Shield", "touch shield"]
  ],
  rage: { Miasma: 14, Magnesium: 36, Caustic: 17, Pathogen: 25, Cadmium: 22, Hypnotic: 28, Provoke: 32 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Caustic"],
  // Still to capture, past level 35 (#149): PATHOGEN++ (target inhibited
  // or afraid), Hypnotic; Caustic on a shielded target. Caustic on an
  // unshielded one prints the shared "Your rage is wasted" line.
  lines: [
    [/^Directing the energy of iron, you engulf (.*)'s body with ashen flames, which burn (\w+) skin with their frigid touch\.$/, "IRON"],
    [/^You quickly mix together several chemical by-products and fling the toxic mixture into (.*)'s face, causing (\w+) to cough and choke\.$/, "MIASMA", "Miasma"],
    [/^You sketch out the symbol for magnesium and direct the energy to sear (.*)'s flesh\.$/, "MAGNESIUM", "Magnesium"],
    [/^You sketch a bisected triangle in the air and direct the energy of cadmium to pierce (.*)'s skin, weakening (\w+)\.$/, "CADMIUM", "Cadmium"],
    // Copper: the equilibrium shieldbreak, tagged whether or not there was a
    // shield to shatter.
    [/^Directing the energy of copper, you send myriad russet streams towards (.*), shattering (\w+) shield\.$/, "COPPER"],
    [/^Directing the energy of copper, you send myriad russet streams towards (.*), which whip around (\w+) ineffectually\.$/, "COPPER"],
    // Pathogen: the plain line is the one where the target fights off the
    // worst; any other line that starts the same way (likely PATHOGEN++) is
    // tagged PATHOGEN until it's captured.
    [/^You quickly combine and throw the virulent pathogen at (.*)\. The chemical seeps through (\w+) skin but (\w+) is able to fight off the worst of its effects\.$/, "PATHOGEN", "Pathogen"],
    [/^You quickly combine and throw the virulent pathogen at /, "PATHOGEN", "Pathogen"]
  ]
};
