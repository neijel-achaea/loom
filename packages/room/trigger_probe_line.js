// Every line, while room has a PROBE out (loyals): gagged and read by
// R.probeLine. Nothing happens otherwise.
if (client.loom && client.loom.room && client.loom.room.probing) client.loom.room.probeLine(current_text());
