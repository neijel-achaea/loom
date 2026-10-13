// Druid: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
HU.classes["Druid"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    maul: ["Maul", "queue add b!wu!t!p wreathe | queue add b!wu!t!p maul @tar"]
  },
  keys: [
    ["{main}", ""],
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
  // Morphing breaks if anything is sent: pause from the call to the spirits
  // until the transformation (or the Morph change in charstats).
  pauses: [
    [/^You throw your arms wide and a cry rings out from your lips, a clarion call to the ancient spirits of nature to taste the joy of life once more\.$/,
     /^You are surrounded by a shining corona of blinding light as your soul is transformed by metamorphosis\.$/]
  ],
  rage: { Strangle: 14, Redeem: 22, Vinecrack: 17, Ravage: 36, Sear: 25, Glare: 14 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Vinecrack"],
  lines: [
    [/You roar in rage and spring upon/, "RAVAGE", "Ravage"],
    [/^You spring forwards onto /, "MAUL"],
    [/Rising in response to your incantation, vines burst forth from the very earth/, "STRANGLE", "Strangle"],
    [/You cause the tip of your quarterstaff to glow brightly before thrusting it at the face of/, "GLARE", "Glare"],
    // Sear: matched on its opening, so the line counts whether the target
    // averts its eyes (as here, on a stunned one) or takes the full beam.
    [/^You hold your quarterstaff aloft and focus a beam of intense sunlight on /, "SEAR", "Sear"],
    [/^At your command, undergrowth rises from the ground under (.*) and pierces (\w+) skin/, "REDEEM", "Redeem"],
    [/^You clench one fist before (.*) and vines grow up to entangle (\w+) translucent shield/, "VINECRACK", "Vinecrack"]
  ]
};
