// Green Dragon: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Keys and rage costs from the wiki
// (Battlerage). No attack lines captured yet (#149): until they are, the
// lines aren't tagged and a key lights on rage alone, not its cooldown.
// SLAVER ON <target> is the wiki's syntax; check it in game.
HU.classes["Green Dragon"] = {
  keys: [
    ["{DRAGON}", "queue add eb!wu!t!p {dragon} @tar", "main"],
    ["Dragonspit", huQ + "dragonspit @tar"],
    ["Override", huQ + "override @tar"],
    ["Blast", "queue add eb!wu!t!p blast @tar", "main"],
    ["Slaver", huQ + "slaver on @tar"],
    ["Dragonsap", huQ + "dragonsap @tar"],
    ["Scour", huQ + "scour @tar"],
    ["{MODE}", "hunting dragonmode"],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Dragonheal", "queue add eq!wu!t!p dragonheal", "main"],
    ["Shield", "touch shield"]
  ],
  rage: { Dragonspit: 14, Scour: 18, Deteriorate: 17, Override: 36, Slaver: 25, Dragonsap: 22 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Deteriorate"],
  // Blast also breaks a shield, on balance (the basher, see README, razeAttack).
  razeAttack: "Blast",
  lines: [
    // Gut and Incantation, every dragon's main attacks (as Black Dragon's);
    // the basher starts a run on them.
    [/^You rip into (.*) with your massive, deadly claws\.$/, "GUT"],
    [/^Drawing from the well of your puissance, you invoke a dramatic chant in the dragon tongue. Your voice resonates with each word, culminating in a wave of magical energy that you bend to your will and thrust towards (.*), bombarding (\w+) with the ancient power\.$/, "INCANTATION"],
    [/^You let out a great keening, and cast the impurities from your form\.$/, "DRAGONHEAL"]
  ]
};
