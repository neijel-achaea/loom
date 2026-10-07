run_function("tal_ensure", [], "talismans");
var color = String(args[1]).toLowerCase();
var type  = String(args[2]).toLowerCase();
var level = parseInt(args[3], 10);
if (!isNaN(level)) {
  client.tal.add(color, type, level, 1);
  run_function("tal_sync", [], "talismans");
  display_notice("[talismans] +" + color + " " + type + " (lvl " + level + ") - now have " + client.tal.getcount(color, type), "cyan");
}