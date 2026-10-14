// huntstats_finalize -- close the current hunt. It is filed only when it
// earned experience over a minute or more; either way the accumulators are
// cleared (the area and level reading stay) and the checkpoint is dropped.
// Called on leaving an area, by HUNTSTATS FLUSH, and by loom's QUIT wrapper.
if (!client.loom || !client.loom.huntstats || !client.loom.huntstats.xpTable) run_function("huntstats_setup", [], "huntstats");
var HS = client.loom.huntstats;
var T = HS.cur;

if (T && T.firstXpAt && T.xp > 0 && (T.lastXpAt - T.firstXpAt) >= 60000) {
  var ms = T.lastXpAt - T.firstXpAt;
  var hrs = ms / 3600000;
  var xpHr = Math.round(T.xp / hrs);
  var goldHr = Math.round(T.gold / hrs);

  var ep = HS.dragon();
  // No Dragonhood gain for a hunt that started as a dragon.
  var dGain = (ep !== null && T.startDragonPct !== null && T.startDragonPct !== undefined && T.startDragonPct < 100) ? (ep - T.startDragonPct) : null;

  var players = [];
  for (var k in T.players) { if (T.players.hasOwnProperty(k)) players.push(k); }

  var rec = { area: T.area, xp: T.xp, gold: T.gold, kills: T.kills || 0, ms: ms,
              xpHr: xpHr, goldHr: goldHr, dGain: dGain, players: players, at: Date.now() };

  var log = [];
  try { log = JSON.parse(get_variable("huntstats_log")) || []; } catch (e) { log = []; }
  log.unshift(rec);
  if (log.length > 5) log = log.slice(0, 5);
  set_variable("huntstats_log", JSON.stringify(log));

  var areas = {};
  try { areas = JSON.parse(get_variable("huntstats_areas")) || {}; } catch (e) { areas = {}; }
  var a = areas[rec.area] || { xp: 0, gold: 0, kills: 0, ms: 0, sessions: 0 };
  a.xp += rec.xp; a.gold += rec.gold; a.kills += rec.kills; a.ms += rec.ms; a.sessions += 1;
  areas[rec.area] = a;
  set_variable("huntstats_areas", JSON.stringify(areas));

  var extra = (dGain !== null) ? (", " + (dGain < 0 ? "" : "+") + dGain.toFixed(3) + "% dragon") : "";
  display_notice("[huntstats] " + rec.area + ": " + rec.xp.toLocaleString() + " xp (" + xpHr.toLocaleString() + "/hr), " + rec.gold.toLocaleString() + " gold, " + rec.kills + " kills, " + HS.dur(ms) + extra, "lime");
  run_function("huntstats_render", [], "huntstats");
}

HS.fresh();
HS.lastSave = 0;
try { set_variable("huntstats_open", ""); } catch (e) {}
