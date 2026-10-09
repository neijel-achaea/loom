// Psion: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Costs and lines from Ricardo's pre-Loom hunting package; to be completed
// with the rest of #30.
HU.classes["Psion"] = {
  // keys: still to come (commands per F-key). Until then: generic keys.
  rage: { Barbedblade: 14, Devastate: 36, Regrowth: 24, Pulverise: 17, Whirlwind: 25, Terror: 32, Provoke: 32 },
  // Still to capture (#31): Regrowth, Pulverise (on a shielded target),
  // Whirlwind, Terror, Provoke, and any ++ variant.
  lines: [
    [/^Charging forward, you drive a translucent spear into (.*)\.$/, "CHARGE"],
    [/^You weave a jagged blade into being and viciously hack at (.*), opening bleeding wounds\.$/, "BARBEDBLADE", "Barbedblade"],
    [/^You hammer the mind of (.*) with a devastating psionic onslaught\.$/, "DEVASTATE", "Devastate"]
  ]
};
