// fishing_cast -- bait the hook with the bait set and cast in the direction
// left in client.loom.fishing.dir (FISHING CAST and CL). When FISHING REBAIT
// already baited the hook after the last catch, it only casts.
var FI = client.loom.fishing;
var fiBait = get_variable("fishing_bait");
if (!FI.dir) {
  display_notice("[fishing] cast where? FISHING CAST <direction> (or CL <direction>).", "orange");
} else if (!fiBait) {
  display_notice("[fishing] no bait set. FISHING BAIT <bait> first.", "orange");
} else {
  if (!FI.baited) send_command("bait hook with " + fiBait);
  send_command("cast line " + FI.dir);
  FI.baited = false;
}
FI.dir = "";
