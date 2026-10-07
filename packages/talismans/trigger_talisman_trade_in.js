run_function("tal_ensure", [], "talismans");
var level = parseInt(args[2], 10);
var color = String(args[3]).toLowerCase();
var type  = String(args[4]).toLowerCase();
if (!isNaN(level)) {
  client.tal.add(color, type, level, 1);
  run_function("tal_sync", [], "talismans");
  display_notice("[talismans] traded IN " + color + " " + type + " (lvl " + level + ")", "cyan");
}