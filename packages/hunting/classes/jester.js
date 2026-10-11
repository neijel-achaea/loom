// Jester: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Noogie 16s,
// Ensconce 23s, Befuddle 23s, Dustthrow 25s, Rap 33s, Provoke 20s.
// Class conditions: none in charstats.
HU.classes["Jester"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    bop: ["Bop", "queue add b!wu!t!p bop @tar"]
  },
  keys: [
    ["{main}", ""],
    ["Noogie", huQ + "noogie @tar"],
    ["Ensconce", huQ + "ensconce firecracker on @tar"],
    ["Jacks", huQ + "throw jacks at @tar"],
    ["Befuddle", huQ + "befuddle @tar"],
    ["Dustthrow", huQ + "dustthrow @tar"],
    ["Rap", huQ + "rap @tar"],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["", ""],
    ["Shield", "touch shield"]
  ],
  rage: { Noogie: 14, Ensconce: 36, Jacks: 17, Befuddle: 25, Dustthrow: 18, Rap: 26, Provoke: 32 },
  // Past level 35 (#149): BEFUDDLE++ (target in aeon or amnesiac); Rap.
  // Befuddle: the plain line is the "minor headache" one; any other line
  // that starts the same way (likely the ++ one) is tagged BEFUDDLE until
  // it's captured.
  lines: [
    [/^You reach out and bop (.*) on the nose with your blackjack\.$/, "BOP"],
    [/^You wrap (.*) in a tight headlock and repeatedly rub your knuckles painfully across (\w+) scalp\.$/, "NOOGIE", "Noogie"],
    [/^You discreetly secret a lit firecracker to (.*?)\./, "ENSCONCE", "Ensconce"],
    [/^You throw a handful of small metallic jacks at (.*), the sharpened points shredding (\w+) translucent shield\.$/, "JACKS", "Jacks"],
    [/^You strike up a bantering dialogue with (.*), but you're only able to cause a minor headache\.$/, "BEFUDDLE", "Befuddle"],
    [/^You strike up a bantering dialogue with /, "BEFUDDLE", "Befuddle"],
    [/^You take a pinch of diamond dust and flick it at (.*)'s face\./, "DUSTTHROW", "Dustthrow"]
  ]
};
