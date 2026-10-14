// "You pick up <n> gold sovereigns." Counts for the hunt's gold an hour, and
// as gold in your hands for the party split (#89).
var HS = client.loom && client.loom.huntstats;
if (HS && HS.cur && HS.cur.area !== undefined) {
  var hsG = parseInt(String(args[1]).replace(/,/g, ""), 10);
  if (!isNaN(hsG)) {
    HS.cur.gold += hsG;
    if (HS.held) HS.held("you", hsG);
  }
}
