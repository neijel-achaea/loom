// defcon_set -- applies DEFCON D.want (1-5): curing priorities for every
// defence of a tier >= the level, reset (and relax) for the rest. Setting the
// level you are already at resends everything (a resync).
var D = client.loom.defcon;
run_function("defcon_table", [], "defcon");
var dcDefs = D.tbl.defs;
var dcStored = get_variable("defcon_level");
var dcFirst = (dcStored === null || dcStored === undefined);
var dcOld = dcFirst ? 5 : to_number(dcStored);
var dcLevel = D.want;
var dcResync = (dcLevel === dcOld) || dcFirst;
var dcQueue = [];

for (var dcI = 0; dcI < dcDefs.length; dcI++) {
  var dcName = dcDefs[dcI][0];
  var dcWant = dcDefs[dcI][1] >= dcLevel;
  var dcHad = dcDefs[dcI][1] >= dcOld;
  var dcRelax = dcDefs[dcI][3];
  if (dcWant && (dcResync || !dcHad)) {
    dcQueue.push("curing priority defence " + dcName + " " + dcDefs[dcI][2]);
  } else if (!dcWant && (dcResync || dcHad)) {
    dcQueue.push("curing priority defence " + dcName + " reset");
    if (dcRelax) dcQueue.push("relax " + dcName);
  }
}

set_variable("defcon_level", dcLevel);
if (D.timer) { clearTimeout(D.timer); D.timer = null; }
D.queue = dcQueue;

var dcNote = D.tbl.known ? "" : " (" + D.tbl.name + " not configured yet: general defences only)";
if (dcQueue.length === 0) {
  display_notice("[defcon] DEFCON " + dcLevel + ": no changes" + dcNote + ".", "cyan");
} else {
  display_notice("[defcon] DEFCON " + dcLevel + ": applying " + dcQueue.length + " changes" + dcNote + "...", "cyan");
  run_function("defcon_drain", [], "defcon");
}
