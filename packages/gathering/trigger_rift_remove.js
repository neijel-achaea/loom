if (client.loom && client.loom.gathering && client.loom.gathering.isRiftName && client.loom.gathering.isRiftName(args[2])) {
  client.loom.gathering.stock[args[2]] = parseInt(args[3].replace(/,/g, ""), 10);
  client.loom.gathering.save();
}
