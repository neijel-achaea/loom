// Druid: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
HU.classes["Druid"] = {
  keys: [
    ["Maul", "queue add b!wu!t!p wreathe | queue add b!wu!t!p maul @tar"],
    ["Strangle", huQ + "strangle @tar"],
    ["Ravage", huQ + "ravage @tar"],
    ["Vinecrack", huQ + "vinecrack @tar"],
    ["Glare", huQ + "quarterstaff glare @tar"],
    ["Sting", "queue add b!wu!t sting @tar"],
    ["Remedy", "evoke remedy {target}"],
    ["Douse", "freeze ground"],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Barrier", "evoke barrier"],
    ["Shield", "touch shield"]
  ],
  rage: { Strangle: 14, Redeem: 22, Vinecrack: 17, Ravage: 36, Sear: 25, Glare: 14 },
  lines: [
    [/You roar in rage and spring upon/, "RAVAGE", "Ravage"],
    [/^You spring forwards onto /, "MAUL"],
    [/Rising in response to your incantation, vines burst forth from the very earth/, "STRANGLE", "Strangle"],
    [/You cause the tip of your quarterstaff to glow brightly before thrusting it at the face of/, "GLARE", "Glare"]
  ]
};
