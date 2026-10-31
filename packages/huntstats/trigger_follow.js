// Following lines (#188): whoever follows you or you follow is in the hunt's
// party (HS.followLine in huntstats_setup).
var HS = client.loom && client.loom.huntstats;
if (HS && HS.followLine) HS.followLine(args[0]);
