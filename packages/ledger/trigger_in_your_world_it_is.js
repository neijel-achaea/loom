// Known last line of the DATE block - this is what closes the capture.
if (client.loom && client.loom.ledger && client.loom.ledger.inBlock) {
  gag_current_line();
  client.loom.ledger.inBlock = false;
}
