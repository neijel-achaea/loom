// Infernal: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Costs and lines from Ricardo's pre-Loom hunting package (Karver).
// Class conditions (charstats, for self): Essence, Spec.
HU.classes["Infernal"] = {
  // keys: still to come (commands per F-key). Until then: generic keys.
  rage: { Ravage: 14, Soulshield: 20, Shiver: 17, Spike: 36, Hellstrike: 25, Deathlink: 30, Provoke: 32 },
  // Still to capture (#31): Shiver (on a shielded target), Deathlink,
  // Provoke, and any ++ variant.
  lines: [
    [/^Drawing back (.*), you unleash a flesh-mincing blow at (.*)\.$/, "SLAUGHTER"],
    [/^Lunging forward, you bring (.*) down in a savage diagonal blow, carving through (.*)'s magical shield\.$/, "CARVE"],
    [/^A black tendril of mist coalesces from your hand and enters (.*)'s brain, causing (\w+) to flinch in pain\.$/, "RAVAGE", "Ravage"],
    [/^A miasma of black flames springs up around you\.$/, "SOULSHIELD", "Soulshield"],
    [/^You leap upon (.*), forming putrid spikes on your armour that tear into (\w+) flesh\.$/, "SPIKE", "Spike"],
    [/^Dark fire courses down (.*) as you strike (.*) with a solid blow\.$/, "HELLSTRIKE", "Hellstrike"]
  ]
};
