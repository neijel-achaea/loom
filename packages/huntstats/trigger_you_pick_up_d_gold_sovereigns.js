if (client.track && client.track.area !== undefined) {
  var g = parseInt(args[1].replace(/,/g, ""), 10);
  if (!isNaN(g)) { client.track.gold += g; }
}