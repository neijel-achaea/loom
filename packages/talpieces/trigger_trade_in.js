if (!client.loom || !client.loom.talpieces || !client.loom.talpieces.pieces) run_function("talpieces_setup", [], "talpieces");
var TP = client.loom.talpieces;
var level = parseInt(args[2], 10);
var color = String(args[3]).toLowerCase();
var type  = String(args[4]).toLowerCase();
if (!isNaN(level)) {
  TP.add(color, type, level, 1);
  run_function("talpieces_sync", [], "talpieces");
  display_notice("[talpieces] traded IN " + color + " " + type + " (lvl " + level + ")", "cyan");
}