// Gold Dragon: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Keys and rage costs from the wiki
// (Battlerage). No attack lines captured yet (#149): until they are, the
// lines aren't tagged and a key lights on rage alone, not its cooldown.
// GMCP may send "Golden Dragon": both names get this table.
HU.classes["Gold Dragon"] = {
  keys: [
    ["{DRAGON}", "queue add eb!wu!t!p {dragon} @tar", "main"],
    ["Overwhelm", huQ + "overwhelm @tar"],
    ["Psiblast", huQ + "psiblast @tar"],
    ["Blast", "queue add eb!wu!t!p blast @tar", "main"],
    ["Psistorm", huQ + "psistorm @tar"],
    ["Deaden", huQ + "deaden @tar"],
    ["Psidaze", huQ + "psidaze @tar"],
    ["{MODE}", "hunting dragonmode"],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Dragonheal", "queue add eq!wu!t!p dragonheal", "main"],
    ["Shield", "touch shield"]
  ],
  rage: { Overwhelm: 14, Deaden: 24, Psishatter: 17, Psiblast: 36, Psistorm: 25, Psidaze: 31 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Psishatter"],
  // Blast also breaks a shield, on balance (the basher, see README, razeAttack).
  razeAttack: "Blast",
  lines: [
    [/^You let out a great keening, and cast the impurities from your form\.$/, "DRAGONHEAL"]
  ]
};
HU.classes["Golden Dragon"] = HU.classes["Gold Dragon"];
