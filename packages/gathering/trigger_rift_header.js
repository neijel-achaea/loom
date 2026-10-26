if (client.loom && client.loom.gathering && client.loom.gathering.envs) {
  var GA = client.loom.gathering;
  GA.inRift = true;
  GA.ownRift = GA.reading;
  GA.dashes = 0;
  if (GA.ownRift) gag_current_line();
}
