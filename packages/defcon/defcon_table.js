// defcon_table -- picks the table for the current class into D.tbl
// ({ name, up, defs, known }). Unknown classes get the generic defences.
var D = client.loom.defcon;
var dcKey = D.alias[D.cls] || D.cls;
var dcEntry = D.classes[dcKey];
if (dcEntry) {
  D.tbl = { name: dcKey, up: dcEntry.up, defs: dcEntry.defs, known: true };
} else {
  D.tbl = { name: D.cls || "unknown", up: [], defs: D.generic, known: false };
}
