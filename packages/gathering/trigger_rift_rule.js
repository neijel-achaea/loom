if (client.loom && client.loom.gathering && client.loom.gathering.inRift) {
  var GA = client.loom.gathering;
  if (GA.ownRift) gag_current_line();
  GA.dashes++;
  if (GA.dashes >= 2) {
    GA.inRift = false;
    if (GA.ownRift) { GA.ownRift = false; GA.reading = false; }
  }
}
