// Sylvan: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
HU.classes["Sylvan"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    thornrend: ["Thornrend", "queue add e!wu!t!p thornrend @tar"]
  },
  keys: [
    ["{main}", ""],
    ["Torrent", huQ + "cast torrent at @tar"],
    ["Sandstorm", huQ + "cast sandstorm at @tar"],
    ["Thornpierce", huQ + "thornpierce @tar"],
    ["Stonevine", huQ + "stonevine @tar"],
    ["Leechroot", huQ + "leechroot @tar"],
    ["Rockshot", huQ + "cast rockshot at @tar"],
    ["Flood", "queue add e cast flood"],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Reflection", "queue add e!wu!t!p cast reflection at me"],
    ["Shield", "touch shield"]
  ],
  rage: { Torrent: 14, Sandstorm: 29, Thornpierce: 17, Stonevine: 36, Leechroot: 25, Rockshot: 28 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Thornpierce"],
  lines: [
    [/^You command the razor-edged thorny vines around you to lash out and rend the flesh of (.*)\.$/, "THORNREND"],
    [/^(.*) coughs and splutters as you channel a gout of water at (\w+) face\.$/, "TORRENT", "Torrent"],
    [/^(.*) stumbles about in fear and flails at (\w+) head as you summon a small sandstorm around it\.$/, "SANDSTORM", "Sandstorm"],
    [/^A thorny vine reaches out from you and pierces through (.*)'s translucent shield, causing it to fade\.$/, "THORNPIERCE", "Thornpierce"],
    [/^You summon a great vine to wrap itself around (.*), then channel the element of earth into it, causing it to become rock hard and shatter as it constricts around (\w+)\.$/, "STONEVINE", "Stonevine"],
    [/^A deadly root flies from your hand and burrows into (.*)'s flesh, but is unable to find sufficient sustenance\.$/, "LEECHROOT", "Leechroot"],
    [/^You form a small pebble, then channel air to fling it violently at (.*)'s head, causing (\w+) to look dazed\.$/, "ROCKSHOT", "Rockshot"]
  ]
};
