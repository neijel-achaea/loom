// Infernal: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Ravage 16s,
// Spike 23s, Hellstrike 23s, Deathlink 43s, Soulshield 37s, Provoke 20s.
// Class conditions (charstats, for self): Essence, Spec.
HU.classes["Infernal"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game. The
  // default follows the specialisation (specMain); other specs to add.
  mains: {
    slaughter: ["Slaughter", "queue add b!wu!t!p slaughter @tar"]
  },
  specMain: { "Two Handed": "slaughter" },
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
  // Still to capture (#31): the other specs' main attacks, Shiver (on a
  // shielded target), Deathlink, and HELLSTRIKE++ (target reckless
  // or afraid).
  lines: [
    [/^Drawing back (.*), you unleash a flesh-mincing blow at (.*)\.$/, "SLAUGHTER"],
    [/^Lunging forward, you bring (.*) down in a savage diagonal blow, carving through (.*)'s magical shield\.$/, "CARVE"],
    [/^A black tendril of mist coalesces from your hand and enters (.*)'s brain, causing (\w+) to flinch in pain\.$/, "RAVAGE", "Ravage"],
    [/^A miasma of black flames springs up around you\.$/, "SOULSHIELD", "Soulshield"],
    [/^You leap upon (.*), forming putrid spikes on your armour that tear into (\w+) flesh\.$/, "SPIKE", "Spike"],
    [/^Dark fire courses down (.*) as you strike (.*) with a solid blow\.$/, "HELLSTRIKE", "Hellstrike"]
  ]
};
