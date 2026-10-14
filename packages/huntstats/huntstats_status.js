// huntstats_status -- the bare HUNTSTATS view: the hunt under way, with
// rates, time to the next level and Dragonhood.
var HS = client.loom.huntstats;
var T = HS.cur;
function say(t, c) { display_notice("[huntstats] " + t, c || "cyan"); }

if (!T || T.area === undefined) {
  say("waiting for room data...", "cyan");
} else if (!T.firstXpAt) {
  say(T.area + " - no kills yet this hunt", "cyan");
} else {
  var ms = Date.now() - T.firstXpAt;
  var hrs = ms / 3600000;
  var xpHr = hrs > 0 ? Math.round(T.xp / hrs) : 0;
  var goldHr = hrs > 0 ? Math.round(T.gold / hrs) : 0;
  say(T.area + " - " + HS.dur(ms));
  say("xp:    " + T.xp.toLocaleString() + "  (" + xpHr.toLocaleString() + "/hr)");
  say("gold:  " + T.gold.toLocaleString() + "  (" + goldHr.toLocaleString() + "/hr)");
  say("kills: " + (T.kills || 0));

  var toNext = HS.xpToNext();
  if (toNext !== null && xpHr > 0) {
    var mNext = Math.round(toNext / xpHr * 60);
    say("level " + (Math.floor(HS.level) + 1) + " in ~" + Math.floor(mNext / 60) + "h " + (mNext % 60) + "m");
  }
  var dh = HS.dragon();
  if (dh !== null && dh < 100) {
    var gained = (T.startDragonPct !== null && T.startDragonPct !== undefined) ? "  (" + ((dh - T.startDragonPct) < 0 ? "" : "+") + (dh - T.startDragonPct).toFixed(3) + "% this hunt)" : "";
    say("Dragonhood: " + dh.toFixed(2) + "%" + gained);
    var toDragon = HS.xpToDragon();
    if (toDragon !== null && xpHr > 0) {
      var mDragon = Math.round(toDragon / xpHr * 60);
      say("Dragonhood ETA: ~" + Math.floor(mDragon / 60) + "h " + (mDragon % 60) + "m");
    }
  }
}
