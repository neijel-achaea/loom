// "You pick up <n> gold sovereigns."
var HS = client.loom && client.loom.huntstats;
if (HS && HS.cur && HS.cur.area !== undefined) {
  var hsG = parseInt(String(args[1]).replace(/,/g, ""), 10);
  if (!isNaN(hsG)) HS.cur.gold += hsG;
}
