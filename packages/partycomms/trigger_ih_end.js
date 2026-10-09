// The last line of an IH lookup: hidden, and the lookup closed. The gold
// line that can follow it is hidden too (trigger_ih_gold).
var PC = client.loom && client.loom.partycomms;
if (PC && PC.ih.on) {
  gag_current_line();
  PC.ih.on = false;
  PC.ih.tail = Date.now() / 1000;
}
