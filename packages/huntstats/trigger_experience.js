// "You have gained <n> experience." -- the hunt starts with the first one.
var HS = client.loom && client.loom.huntstats;
if (HS && HS.cur && HS.cur.area !== undefined) {
  var hsG = parseInt(args[1], 10);
  if (!isNaN(hsG)) {
    if (!HS.cur.firstXpAt) {
      HS.cur.firstXpAt = Date.now();
      HS.cur.startDragonPct = HS.dragon();
      // A hunt has started: tell loom (#39, a gold goal to beat).
      if (client.loom.notify) client.loom.notify("huntstats");
    }
    HS.cur.xp += hsG;
    HS.cur.lastXpAt = Date.now();
    HS.save(false);
    // The hunt under way heads the Stats tab (#90).
    run_function("huntstats_render", [], "huntstats");
  }
}
