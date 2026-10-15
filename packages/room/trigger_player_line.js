// Players arriving and leaving without GMCP: flying up and landing send no
// Room.AddPlayer / Room.RemovePlayer, so these lines keep the Here tab right
// until the next Room.Players (on your next move) settles it. Each line's
// name is the first capture group that matched, so more wordings can be added
// to the triggers' alternations as Ricardo finds them.
if (!client.loom || !client.loom.room || !client.loom.room.raw) run_function("room_setup", [], "room");
var R = client.loom.room;
var plName = "";
for (var plI = 1; plI < args.length; plI++) { if (args[plI]) { plName = String(args[plI]); break; } }
if (plName && plName.toLowerCase() !== String(R.me).toLowerCase()) {
  if (R.lineKind === "in") { if (!R.players[plName]) R.players[plName] = plName; }
  else delete R.players[plName];
  clearTimeout(R.drawT);
  R.drawT = setTimeout(function () { run_function("room_render", [], "room"); }, 50);
}
