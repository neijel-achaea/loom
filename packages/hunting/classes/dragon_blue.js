// Blue Dragon: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
HU.classes["Blue Dragon"] = {
  keys: [
    ["{DRAGON}", "queue add eb!wu!t!p {dragon} @tar", "main"],
    ["Dragonchill", huQ + "dragonchill @tar"],
    ["Override", huQ + "override @tar"],
    ["Blast", "queue add eb!wu!t!p blast @tar", "main"],
    ["Frostwave", huQ + "frostwave @tar"],
    ["Ague", huQ + "ague @tar"],
    ["Glaciate", huQ + "glaciate @tar"],
    ["{MODE}", "hunting dragonmode"],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Dragonheal", "queue add eq!wu!t!p dragonheal", "main"],
    ["Shield", "touch shield"]
  ],
  rage: { Dragonchill: 14, Glaciate: 26, Frostrive: 17, Frostwave: 25, Ague: 14, Override: 36 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Frostrive"],
  // Blast also breaks a shield, on balance (the basher, see README, razeAttack).
  razeAttack: "Blast",
  lines: [
    // Gut and Incantation, every dragon's main attacks (as Black Dragon's);
    // the basher starts a run on them.
    [/^You rip into (.*) with your massive, deadly claws\.$/, "GUT"],
    [/^Drawing from the well of your puissance, you invoke a dramatic chant in the dragon tongue. Your voice resonates with each word, culminating in a wave of magical energy that you bend to your will and thrust towards (.*), bombarding (\w+) with the ancient power\.$/, "INCANTATION"],
    // Override, as Black Dragon's (a shared dragon ability).
    [/^You barrel into (.*) and knock (\w+) to the ground before stomping over (\w+) prone form\.$/, "OVERRIDE", "Override"],
    [/^You form small chunks of ice in your enormous maw, then spit them at (.*) in a barrage\.$/, "DRAGONCHILL", "Dragonchill"],
    [/^You breathe a wave of icy air at (.*)\.$/, "FROSTWAVE", "Frostwave"],
    [/^You let loose a steady stream of cold air around (.*), who begins to shiver uncontrollably\.$/, "AGUE", "Ague"],
    [/^You breathe a column of icy air at (.*)'s head, stunning (\w+)\.$/, "GLACIATE", "Glaciate"],
    [/^You let out a great keening, and cast the impurities from your form\.$/, "DRAGONHEAL"],
    [/^Opening your massive maw, you throw your head forward and blast wave after wave of deadly, all-consuming cold at (.*)\.$/, "BLAST"]
  ]
};
