// Black Dragon: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
HU.classes["Black Dragon"] = {
  keys: [
    ["{DRAGON}", "queue add eb!wu!t!p {dragon} @tar", "main"],
    ["Dragonspit", huQ + "dragonspit @tar"],
    ["Override", huQ + "override @tar"],
    ["Blast", "queue add eb!wu!t!p blast @tar", "main"],
    ["Corrode", huQ + "corrode @tar"],
    ["Dragonsting", huQ + "dragonsting @tar"],
    ["Dragonfear", huQ + "dragonfear @tar"],
    ["{MODE}", "hunting dragonmode"],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Dragonheal", "queue add eq!wu!t!p dragonheal", "main"],
    ["Shield", "touch shield"]
  ],
  rage: { Dragonspit: 14, Dragonsting: 25, Dissolve: 17, Override: 36, Corrode: 25, Dragonfear: 29, Provoke: 32 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Dissolve"],
  lines: [
    [/^You rip into (.*) with your massive, deadly claws\.$/, "GUT"],
    [/^You spit a stream of acidic venom at (.*) who writhes in agony as the spittle seeps into (\w+) skin\.$/, "DRAGONSPIT", "Dragonspit"],
    [/^Drawing from the well of your puissance, you invoke a dramatic chant in the dragon tongue. Your voice resonates with each word, culminating in a wave of magical energy that you bend to your will and thrust towards (.*), bombarding (\w+) with the ancient power\.$/, "INCANTATION"],
    [/^You open your gigantic maw and spew acid on (.*). (\w+) dodges to the side and is only partially covered by the corrosive slime\.$/, "CORRODE", "Corrode"],
    [/^You open your gigantic maw and spew acid on (.*)\. (\w+) is too clumsy to dodge the deluge and is coated in the corrosive slime\.$/, "CORRODE++", "Corrode"],
    [/^You bathe (.*)'s translucent shield in your noxious breath, dissolving it\.$/, "DISSOLVE", "Dissolve"],
    [/^You swing your mighty tail around, stabbing (.+) with an acid-covered spine\.$/, "DRAGONSTING", "Dragonsting"],
    [/^Opening your maw, you force out a tremendous stream of acid, blasting the flesh from the very bones of (.*)\.$/, "BLAST"],
    [/^You barrel into (.*) and knock (\w+) to the ground before stomping over (\w+) prone form\.$/, "OVERRIDE", "Override"],
    [/^You open your enormous maw and let loose a mighty roar at (.*), causing (\w+) to quail in fear\.$/, "DRAGONFEAR", "Dragonfear"],
    [/^You let out a great keening, and cast the impurities from your form\.$/, "DRAGONHEAL"]
  ]
};
