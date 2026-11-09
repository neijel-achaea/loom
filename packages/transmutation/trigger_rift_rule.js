if (client.loom && client.loom.transmutation && client.loom.transmutation.inRift) {
  var TR = client.loom.transmutation;
  if (TR.ownRift) gag_current_line();
  TR.dashes++;
  if (TR.dashes >= 2) {
    TR.inRift = false;
    if (TR.ownRift) { TR.ownRift = false; TR.reading = false; TR.decide(); }
  }
}
