// Apostate: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Convulsions 16s,
// Burrow 23s, Bloodlet 23s, Possess 43s, Horrify 34s, Provoke 20s.
// Class condition (charstats, for self): Essence.
HU.classes["Apostate"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    bleed: ["Bleed", "queue add b!wu!t!p deadeyes @tar bleed bleed"]
  },
  keys: [
    ["{main}", ""],
    ["Convulsions", huQ + "stare @tar convulsions"],
    ["Burrow", huQ + "daegger burrow @tar"],
    ["Pierce", huQ + "daegger pierce @tar"],
    ["Bloodlet", huQ + "bloodlet @tar"],
    ["Possess", huQ + "possess @tar"],
    ["", ""],
    ["{toggle:sneak}", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Horrify", huQ + "stare @tar horrify"],
    ["Shield", "touch shield"]
  ],
  // Sneak: SHROUD / UNSHROUD, shrouding again when the shroud wears off.
  toggles: {
    sneak: { label: "Sneak", on: ["shroud"], off: ["unshroud"],
             renew: [/^Your shroud dissipates and you return to the realm of perception\.$/, "shroud"] }
  },
  rage: { Convulsions: 14, Burrow: 36, Pierce: 17, Bloodlet: 25, Possess: 32, Horrify: 29, Provoke: 32 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Pierce"],
  // Past level 35 (#149): Burrow and Pierce (need the daegger, from
  // Apostasy at level 50), Bloodlet, plain and BLOODLET++ (target sensitive
  // or stunned), Possess.
  lines: [
    [/^You stare at (.*), giving (\w+) the evil eye\. Blood begins to flow from (\w+) pores\.$/, "BLEED"],
    [/^You stare at (.*), giving (\w+) the evil eye\. (\w+) limbs begin to convulse\.$/, "CONVULSIONS", "Convulsions"],
    [/^You stare at (.*), giving (\w+) the evil eye\. Terror floods (.*)'s features as (\w+) begins to run about in a panic\.$/, "HORRIFY", "Horrify"]
  ]
};
