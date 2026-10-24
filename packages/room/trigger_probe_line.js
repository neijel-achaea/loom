// Every line: while room has a PROBE out (loyals), gagged and read by
// R.probeLine; otherwise R.probeIdle watches for the prompt line, where a
// waiting probe goes out.
var rmPl = client.loom && client.loom.room;
if (rmPl) { if (rmPl.probing) rmPl.probeLine(current_text()); else if (rmPl.probeIdle) rmPl.probeIdle(current_text()); }
