if (client.loom && client.loom.transmutation && client.loom.transmutation.envs) {
  var TR = client.loom.transmutation;
  TR.inRift = true;
  TR.ownRift = TR.reading;
  TR.dashes = 0;
  if (TR.ownRift) gag_current_line();
}
