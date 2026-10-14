if (!client.loom || !client.loom.talpieces || !client.loom.talpieces.pieces) run_function("talpieces_setup", [], "talpieces");
var TP = client.loom.talpieces;
var color = String(args[1]).toLowerCase();
var type  = String(args[2]).toLowerCase();
var level = parseInt(args[3], 10);
if (!isNaN(level)) {
  TP.add(color, type, level, 1);
  run_function("talpieces_sync", [], "talpieces");
  display_notice("[talpieces] +" + color + " " + type + " (lvl " + level + ") - now have " + TP.getcount(color, type), "lime");
}