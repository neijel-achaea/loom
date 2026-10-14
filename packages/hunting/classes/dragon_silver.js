// Silver Dragon: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Keys and rage costs from the wiki
// (Battlerage). No attack lines captured yet (#149): until they are, the
// lines aren't tagged and a key lights on rage alone, not its cooldown.
HU.classes["Silver Dragon"] = {
  keys: [
    ["{DRAGON}", "queue add eb!wu!t!p {dragon} @tar", "main"],
    ["Overwhelm", huQ + "overwhelm @tar"],
    ["Dragonspark", huQ + "dragonspark @tar"],
    ["Blast", "queue add eb!wu!t!p blast @tar", "main"],
    ["Stormflare", huQ + "stormflare @tar"],
    ["Sizzle", huQ + "sizzle @tar"],
    ["Galvanize", huQ + "galvanize @tar"],
    ["{MODE}", "hunting dragonmode"],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Dragonheal", "queue add eq!wu!t!p dragonheal", "main"],
    ["Shield", "touch shield"]
  ],
  rage: { Overwhelm: 14, Sizzle: 25, Splinter: 17, Dragonspark: 36, Stormflare: 25, Galvanize: 18 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Splinter"],
  lines: [
    [/^You let out a great keening, and cast the impurities from your form\.$/, "DRAGONHEAL"]
  ]
};
