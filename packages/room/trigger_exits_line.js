// The exits line ends a room's text (LOOK, or walking in): probes held since
// the move (R.probeHold) may go now, after it, never during it.
if (client.loom && client.loom.room && client.loom.room.probeHold && !client.loom.room.probing) {
  client.loom.room.probeHold = "";
  client.loom.room.probeNext();
  // The probe's catch-all trigger sees this same line next: not its answer.
  if (client.loom.room.probing) client.loom.room.probing.start = current_text();
}
