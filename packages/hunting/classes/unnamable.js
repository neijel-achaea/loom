// Unnamable: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Shriek 16s,
// Destroy 23s, Onslaught 23s, Entropy 38s, Dread 35s, Provoke 20s.
// Class conditions (charstats, for self): Karma, Anathema (Yes/No),
// Manifestation, Spec.
HU.classes["Unnamable"] = {
  // Main attacks for F1 and their lines come from the weapon specs, shared
  // by the knight classes (hunting_weapons.js); Doublewhirl first, so it's the
  // default with no spec. HUNTING MAIN adds more in game.
  mains: {
    doublewhirl: ["Doublewhirl", "queue add b!wu!t!p doublewhirl @tar"]
  },
  weapons: true,
  keys: [
    ["{main}", ""],
    ["Shriek", huQ + "unnamable shriek @tar"],
    ["Destroy", huQ + "unnamable destroy @tar"],
    // Fracture: the balance shieldbreak (no rage). Sunder is the rage one,
    // tracked but without a key.
    ["Fracture", "queue add b!wu!t!p fracture @tar shield"],
    ["Onslaught", huQ + "unnamable onslaught @tar"],
    ["Entropy", huQ + "croon entropy @tar"],
    ["", ""],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Dread", huQ + "croon dread @tar"],
    ["Shield", "touch shield"]
  ],
  rage: { Shriek: 14, Destroy: 36, Sunder: 17, Onslaught: 25, Entropy: 32, Dread: 24, Provoke: 32 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Sunder"],
  // For #149: Fracture and Sunder (on a shielded target); Onslaught, plain and
  // ONSLAUGHT++ (target charmed or sensitive); Entropy.
  lines: [
    [/^Your many mouths shriek at (.*), a wrath-filled cry given ancient power\.$/, "SHRIEK", "Shriek"],
    [/^You lash out with power and will, your only task to crush the light from your wretched target, (.*)\.$/, "DESTROY", "Destroy"],
    [/^You croon to (.*) of terror, of the fear of aeons, of the ineffable dread, each of your mouths joined in profane design\.$/, "DREAD", "Dread"]
  ]
};
