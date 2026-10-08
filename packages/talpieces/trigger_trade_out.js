// Unlike the Mudlet system (which relied on the TTRADE alias to pre-decrement),
// this passive port removes the piece here so trading away stays accurate.
if (!client.loom || !client.loom.talpieces || !client.loom.talpieces.pieces) run_function("talpieces_setup", [], "talpieces");
var TP = client.loom.talpieces;
var level = parseInt(args[1], 10);
var color = String(args[2]).toLowerCase();
var type  = String(args[3]).toLowerCase();
if (!isNaN(level)) {
  TP.remove(color, type, level, 1);
  run_function("talpieces_sync", [], "talpieces");
  display_notice("[talpieces] traded OUT " + color + " " + type + " (lvl " + level + ")", "cyan");
}