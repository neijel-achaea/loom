// "You have slain ..."
var HS = client.loom && client.loom.huntstats;
if (HS && HS.cur && HS.cur.area !== undefined) {
  HS.cur.kills = (HS.cur.kills || 0) + 1;
  HS.cur.lastXpAt = Date.now();
}
