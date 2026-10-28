// Every line: while primed and not yet running, one of your own attack lines
// (hunting's patterns, read only) starts the run. While the room's list isn't
// known (installed mid-room), your kill ends the run instead of the list.
// Afflictions on mobs (B.affLines) and razed shields (B.razeLine) are
// noted whenever the basher is on.
var B = client.loom && client.loom.basher;
if (B && B.on) {
  var bsLine = String(args[1] || "");
  // Stunned or knocked down (Ricardo's log 2026-10-28): the attack never went
  // out, so it isn't a miss; it goes again on the next recovery.
  if (B.run && /^(?:You are too stunned to be able to do anything\.|You must be standing first\.)$/.test(bsLine)) { B.misses = 0; B.sentAt = Date.now(); }
  else if (!B.affLine(bsLine) && !B.razeLine(bsLine)) {
    if (!B.run && B.isAttack(bsLine)) B.begin();
    else if (B.run && !B.roomKnown && /^You have slain /.test(bsLine)) B.end("your target is dead and this room's list isn't known yet");
  }
}
