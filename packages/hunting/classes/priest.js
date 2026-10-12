// Priest: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Torment 16s,
// Desolation 23s, Hammer 23s, Incense 19s, Horrify 34s, Provoke 20s.
// Class conditions (charstats, for self): Angelpower, Devotion, conviction,
// prayer_length, Prayer (Yes/No).
HU.classes["Priest"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    smite: ["Smite", "queue add b!wu!t!p smite @tar"]
  },
  keys: [
    ["{main}", ""],
    ["Torment", huQ + "angel torment @tar"],
    ["Desolation", huQ + "perform rite of desolation on @tar"],
    ["Crack", huQ + "crack @tar"],
    ["Hammer", huQ + "hammer @tar"],
    ["Incense", huQ + "angel incense @tar"],
    ["", ""],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Horrify", huQ + "perform rite of horrify on @tar"],
    ["Shield", "touch shield"]
  ],
  rage: { Torment: 14, Desolation: 36, Crack: 17, Hammer: 25, Incense: 18, Horrify: 29, Provoke: 32 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Crack"],
  // Past level 35 (#149): Hammer, plain and HAMMER++ (target clumsy or
  // amnesiac); Horrify.
  // Weapons and pronouns are left open: they change with what you wield and
  // with your angel.
  lines: [
    [/^You utter a prayer and smite (.*) with (.*)\.$/, "SMITE"],
    [/^Your angel flares its wings and flaps them powerfully at (.*), causing shards of crystal to tear through (\w+) flesh\.$/, "TORMENT", "Torment"],
    [/^Praying to the Gods, you lay a desolating rite on (.*)'s body and watch as (\w+) arches (\w+) back in agony\.$/, "DESOLATION", "Desolation"],
    [/^You strike (.*)'s translucent shield with your (.*), shattering it completely\.$/, "CRACK", "Crack"],
    [/^Your guardian angel becomes translucent as (\w+) floats first through you and then (.*), absorbing your rage and passing it to (\w+)\.$/, "INCENSE", "Incense"]
  ]
};
