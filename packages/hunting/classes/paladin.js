// Paladin: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Harrow 16s,
// Shock 23s, Punishment 23s, Recovery 44s, Provoke 20s, Regeneration 53s.
// Class conditions (charstats, for self): Wrath, wrathbal, Spec.
HU.classes["Paladin"] = {
  // Main attacks for F1 and their lines come from the weapon specs, shared
  // by the knight classes (hunting_weapons.js); Doubleslash first, so it's the
  // default with no spec. HUNTING MAIN adds more in game.
  mains: {
    doubleslash: ["Doubleslash", "queue add b!wu!t!p dsl @tar"]
  },
  weapons: true,
  keys: [
    ["{main}", ""],
    ["Harrow", huQ + "harrow @tar"],
    ["Shock", huQ + "perform rite of shock at @tar"],
    ["Faithrend", huQ + "faithrend @tar"],
    ["Punishment", huQ + "perform rite of punishment at @tar"],
    ["Recovery", huQ + "perform recovery {target}"],
    ["Provoke", huQ + "provoke @tar"],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Regeneration", huQ + "perform rite of regeneration"],
    ["Shield", "touch shield"]
  ],
  rage: { Harrow: 14, Shock: 36, Faithrend: 17, Punishment: 25, Recovery: 31, Provoke: 32, Regeneration: 33 },
  // Shieldbreak: no cooldown, no global cooldown (see README, razes).
  razes: ["Faithrend"],
  // Doubleslash's lines are Dual Cutting's, in hunting_weapons.js.
  // Past level 35 (#149): Punishment, plain and PUNISHMENT++ (target weakened
  // or clumsy); Recovery.
  lines: [
    [/^Holy fire lends strength to your arm as you bring (.*) crashing down on (.*)\.$/, "HARROW", "Harrow"],
    [/^You perform a holy rite and bind it to (.*)'s soul, creating a conduit for holy lightning to strike down upon (\w+)\.$/, "SHOCK", "Shock"],
    [/^You raise (.*) high in the air and utter a quick prayer as you bring it crashing down on (.*), shattering (\w+) translucent shield\.$/, "FAITHREND", "Faithrend"],
    [/^You perform a holy rite and a gold-tinged aura springs up around you\.$/, "REGENERATION", "Regeneration"]
  ]
};
