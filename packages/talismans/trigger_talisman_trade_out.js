// Unlike the Mudlet system (which relied on the TTRADE alias to pre-decrement),
// this passive port removes the piece here so trading away stays accurate.
run_function("tal_ensure", [], "talismans");
var level = parseInt(args[1], 10);
var color = String(args[2]).toLowerCase();
var type  = String(args[3]).toLowerCase();
if (!isNaN(level)) {
  client.tal.remove(color, type, level, 1);
  run_function("tal_sync", [], "talismans");
  display_notice("[talismans] traded OUT " + color + " " + type + " (lvl " + level + ")", "cyan");
}