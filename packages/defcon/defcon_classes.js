// defcon_classes -- the class tables, built from this file and classes/*.js
// (one file per class; see classes/README.md). Run from defcon_setup.
//
// Per class, in classes/<class>.js, named exactly as GMCP sends the class:
//   up   -- commands DEFCON UP sends for this class, before the common ones
//   defs -- [defence, tier, curing priority, relax?]. A defence is kept up at
//           DEFCON n when its tier >= n. "relax" defences are also dropped
//           (RELAX <def>) when the level no longer wants them.
// A class with no file gets D.generic for its defences and only D.common
// for DEFCON UP.
var D = client.loom.defcon;
D.classes = {};
// Every dragon colour shares the dragonform table.
D.alias = { "Black Dragon": "Dragon", "Blue Dragon": "Dragon", "Red Dragon": "Dragon", "Green Dragon": "Dragon", "Silver Dragon": "Dragon", "Gold Dragon": "Dragon" };

// Sent by DEFCON UP for every class, after the class's own commands.
D.common = ["selfishness", "avoid physical", "insomnia"];

// Defences for a class with no table yet: the general ones every class above shares.
D.generic = [
  ["alertness", 1, 10, true],
  ["vigilance", 1, 10, true],
  ["hypersight", 1, 9, true],
  ["telesense", 1, 10, true],
  ["metawake", 1, 9, true],
  ["mass", 2, 8],
  ["rebounding", 2, 2],
  ["heldbreath", 2, 20],
  ["fangbarrier", 3, 8],
  ["deafness", 3, 4],
  ["blindness", 3, 4],
  ["curseward", 2, 9],
  ["kola", 3, 3],
  ["levitating", 3, 15],
  ["speed", 3, 5],
  ["poisonresist", 3, 8],
  ["nightsight", 4, 13],
  ["deathsight", 4, 18],
  ["thirdeye", 4, 5],
  ["insomnia", 2, 6],
  ["selfishness", 2, 17],
  ["mindseye", 5, 1],
  ["temperance", 3, 8]
];
