// The gold line right after an IH lookup.
var PC = client.loom && client.loom.partycomms;
if (PC && PC.ih.tail && (Date.now() / 1000) - PC.ih.tail < 2) {
  gag_current_line();
  PC.ih.tail = 0;
}
