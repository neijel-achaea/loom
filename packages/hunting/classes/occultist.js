// Occultist: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Harry 16s,
// Chaosgate 23s, Fluctuate 23s, Temperance 43s, Stagnate 35s, Provoke 20s.
// Class conditions (charstats, for self): Karma, Entity (Yes/No).
HU.classes["Occultist"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    warp: ["Warp", "queue add e!wu!t!p warp @tar"]
  },
  keys: [
    ["{main}", ""],
    ["Harry", huQ + "harry @tar"],
    ["Chaosgate", huQ + "chaosgate @tar"],
    ["Ruin", huQ + "ruin @tar"],
    ["Fluctuate", huQ + "fluctuate @tar"],
    ["Temperance", huQ + "temper @tar"],
    ["Stagnate", huQ + "stagnate @tar"],
    ["{toggle:sneak}", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["", ""],
    ["Shield", "touch shield"]
  ],
  // Sneak: SHROUD / UNSHROUD; shrouds again when it dissipates while on.
  toggles: {
    sneak: { label: "Sneak", on: ["shroud"], off: ["unshroud"],
             renew: [/^Your shroud dissipates and you return to the realm of perception\.$/, "shroud"] }
  },
  rage: { Harry: 14, Chaosgate: 36, Ruin: 17, Fluctuate: 25, Temperance: 32, Stagnate: 24, Provoke: 32 },
  // Past level 35 (#149): Fluctuate, plain and FLUCTUATE++ (target afraid or
  // amnesiac); Stagnate.
  lines: [
    [/^You reach out and clench a fist before (.*), who screams and doubles over in agony as (\w+) skin suddenly bubbles with gangrenous growths\.$/, "WARP"],
    [/^Raising your hands in the air, you summon horrific visions to torment (.*)\.$/, "HARRY", "Harry"],
    [/^You cup your hands together and fling them outwards, sending a spiral of shimmering portals into (.*)'s body\.$/, "CHAOSGATE", "Chaosgate"],
    [/^You gesture in a slashing motion at (.*), and small tears form in (\w+) translucent shield as chaos rips it apart\.$/, "RUIN", "Ruin"],
    [/^Multicoloured rays burst forth from your outstretched hands and strike (.*) in the head, forcing (\w+) to obey your will\.$/, "TEMPERANCE", "Temperance"]
  ]
};
