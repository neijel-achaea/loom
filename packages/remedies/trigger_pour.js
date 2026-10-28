// "You carefully pour N sips (salves: applications) of X from <pot> into your rift, bringing the
// total stored sips to M."
var RM = client.loom && client.loom.remedies;
if (RM && RM.run) {
  if (RM.run.out == "pourOld") RM.oldPoured(true, parseInt(String(args[4]).replace(/,/g, ""), 10), args[2]);
  else RM.poured(parseInt(String(args[1]).replace(/,/g, ""), 10), parseInt(String(args[4]).replace(/,/g, ""), 10));
}
