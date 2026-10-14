// Runewarden: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Collide 16s,
// Onslaught 23s, Etch 23s, Safeguard 57s, Bulwark 45s, Provoke 20s.
// Class conditions (charstats, for self): Ferocity, empower, Spec.
HU.classes["Runewarden"] = {
  // Main attacks for F1 and their lines come from the weapon specs, shared
  // by the knight classes (hunting_weapons.js). HUNTING MAIN adds more in game.
  weapons: true,
  keys: [
    ["{main}", ""],
    ["Collide", huQ + "collide @tar"],
    ["Onslaught", huQ + "onslaught @tar"],
    // Raze: the balance shieldbreak (no rage). Fragment is the rage one,
    // tracked but without a key.
    ["Raze", "queue add b!wu!t!p raze @tar", "main"],
    ["Etch", huQ + "etch rune at @tar"],
    ["Safeguard", huQ + "safeguard {target}"],
    ["", ""],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Bulwark", huQ + "bulwark"],
    ["Shield", "touch shield"]
  ],
  rage: { Collide: 14, Onslaught: 36, Fragment: 17, Etch: 25, Safeguard: 35, Bulwark: 28, Provoke: 32 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Fragment"],
  // The combination's and Raze's lines are Sword and Shield's, in
  // hunting_weapons.js.
  // Past level 35 (#149): Fragment (on a shielded target); ETCH++ (target in
  // aeon or stunned); Safeguard.
  lines: [
    [/^You charge at (.*), slamming into (\w+) and throwing (\w+) back\.$/, "COLLIDE", "Collide"],
    [/^You unleash a ferocious onslaught on (.*), relentlessly pounding (\w+) with (.*)\.$/, "ONSLAUGHT", "Onslaught"],
    // Etch: matched on its opening, so a glancing hit (as captured) and a
    // full one both count.
    [/^You trace the outline of a rune in the air with (.*)\. The edges catch fire as it hurtles towards /, "ETCH", "Etch"],
    [/^The runes on your armour flare brightly as you adopt a defensive stance\.$/, "BULWARK", "Bulwark"]
  ]
};
