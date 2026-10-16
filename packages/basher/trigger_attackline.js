// Every line: while primed and not yet running, one of your own attack lines
// (hunting's patterns, read only) starts the run. While the room's list isn't
// known (installed mid-room), your kill ends the run instead of the list.
// Afflictions on mobs (B.affLines) are noted whenever the basher is on.
var B = client.loom && client.loom.basher;
if (B && B.on) {
  var bsLine = String(args[1] || "");
  if (!B.affLine(bsLine)) {
    if (!B.run && B.isAttack(bsLine)) B.begin();
    else if (B.run && !B.roomKnown && /^You have slain /.test(bsLine)) B.end("your target is dead and this room's list isn't known yet");
  }
}
