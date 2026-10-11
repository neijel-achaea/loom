// hunting_classes -- the per-class tables, one file per class in classes/,
// joined after this header by tools/build.py. Run from hunting_setup on every
// load, so the tables are session data, never variables.
// Each class file adds one entry: HU.classes["<class as GMCP names it>"].
var HU = client.loom.hunting;
// Prefix for battlerage keys: queued, so they fire as soon as you can act.
var huQ = "queue add !wu!t!p ";
HU.classes = {};
// Lines every class shares (Provoke, level 100, is the same for all), checked
// after the current class's own lines.
HU.sharedLines = [
  [/^Your back snaps straight as you unleash a fierce bellow at (.*)\.$/, "PROVOKE", "Provoke"]
];
