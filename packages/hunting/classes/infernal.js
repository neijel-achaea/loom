// Infernal: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Ravage 16s,
// Spike 23s, Hellstrike 23s, Deathlink 43s, Soulshield 37s, Provoke 20s.
// Class conditions (charstats, for self): Essence, Spec.
HU.classes["Infernal"] = {
  // Main attacks for F1 and their lines come from the weapon specs, shared
  // by the knight classes (hunting_weapons.js). HUNTING MAIN adds more in game.
  weapons: true,
  keys: [
    ["{main}", ""],
    ["Ravage", huQ + "ravage @tar"],
    ["Spike", huQ + "spike @tar"],
    ["Shiver", huQ + "shiver @tar"],
    ["Hellstrike", huQ + "hellstrike @tar"],
    ["Deathlink", huQ + "deathlink {target}"],
    ["", ""],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Soulshield", huQ + "soulshield"],
    ["Shield", "touch shield"]
  ],
  rage: { Ravage: 14, Spike: 36, Shiver: 17, Hellstrike: 25, Deathlink: 30, Soulshield: 20, Provoke: 32 },
  // Past level 35 (#149): Deathlink (needs someone to cast it on) and
  // HELLSTRIKE++ (target reckless or afraid).
  lines: [
    [/^A black tendril of mist coalesces from your hand and enters (.*)'s brain, causing (\w+) to flinch in pain\.$/, "RAVAGE", "Ravage"],
    [/^A miasma of black flames springs up around you\.$/, "SOULSHIELD", "Soulshield"],
    [/^You leap upon (.*), forming putrid spikes on your armour that tear into (\w+) flesh\.$/, "SPIKE", "Spike"],
    [/^Dark energy wreathes (.*) as you slash at (.*) with it, causing (\w+) translucent shield to crumble\.$/, "SHIVER", "Shiver"],
    [/^Dark fire courses down (.*) as you strike (.*) with a solid blow\.$/, "HELLSTRIKE", "Hellstrike"]
  ]
};
