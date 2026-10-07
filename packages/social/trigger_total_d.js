if (client.hl && client.hl.capturing) {
  client.hl.capturing = false;
  client.hl.save("enemies");
  var have = Object.keys(client.hl.enemies).length;
  var want = parseInt(args[1], 10);
  display_notice("[hl] enemies loaded " + have + " / " + want);
  if (have !== want) display_notice("[hl] WARNING: count mismatch");
}