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

  // Damage taken over the hunt, from dmgchart through loom (#59). Without
  // it (link off, a reload mid-hunt) the hunt is filed without figures
  // rather than wrong ones.
  var dmg = HS.damage(T.firstXpAt);
  if (dmg && dmg.combatMs >= 1000) { rec.dmgIn = dmg.dmg; rec.combatMs = dmg.combatMs; rec.maxHit = dmg.maxHit; }

  var log = [];
  try { log = JSON.parse(get_variable("huntstats_log")) || []; } catch (e) { log = []; } if (!Array.isArray(log)) log = [];
  log.unshift(rec);
  if (log.length > 5) log = log.slice(0, 5);
  set_variable("huntstats_log", JSON.stringify(log));

  var areas = {};
  try { areas = JSON.parse(get_variable("huntstats_areas")) || {}; } catch (e) { areas = {}; } if (!areas || typeof areas != "object" || Array.isArray(areas)) areas = {};
  var a = areas[rec.area] || { xp: 0, gold: 0, kills: 0, ms: 0, sessions: 0 };
  a.xp += rec.xp; a.gold += rec.gold; a.kills += rec.kills; a.ms += rec.ms; a.sessions += 1;
  if (rec.combatMs) {
    // Per area: damage over combat time, summed over the hunts that have it.
    a.dmgIn = (a.dmgIn || 0) + rec.dmgIn;
    a.combatMs = (a.combatMs || 0) + rec.combatMs;
    if (rec.maxHit > (a.maxHit || 0)) a.maxHit = rec.maxHit;
  }
  a.last = rec.at; // when you last hunted here, for HUNTSTATS SUGGEST (#88)
  areas[rec.area] = a;
  set_variable("huntstats_areas", JSON.stringify(areas));

  var dps = rec.combatMs ? HS.rate(rec.dmgIn, rec.combatMs) : null;
  var extra = (dGain !== null) ? (", " + (dGain < 0 ? "" : "+") + dGain.toFixed(3) + "% dragon") : "";
  display_notice("[huntstats] " + rec.area + ": " + rec.xp.toLocaleString() + " xp (" + xpHr.toLocaleString() + "/hr), " + rec.gold.toLocaleString() + " gold, " + rec.kills + " kills, " + HS.dur(ms) + extra + (dps !== null ? ", took " + Math.round(dps).toLocaleString() + "/s (max hit " + rec.maxHit.toLocaleString() + ")" : ""), "lime");
  // The party's gold split (#89), and to party tell with SPLIT TELL ON.
  var spl = HS.split();
  if (spl) {
    for (var spI = 0; spI < spl.length; spI++) display_notice("[huntstats] " + spl[spI], "cyan");
    if (HS.splitTell) HS.tellSplit();
  }
}

HS.fresh();
HS.lastSave = 0;
try { set_variable("huntstats_open", ""); } catch (e) {}
// Redrawn after the hunt is cleared, so the tab no longer shows it as under
// way (#90).
run_function("huntstats_render", [], "huntstats");
// The hunt is over: tell loom (#39 withdraws its goal proposal).
if (client.loom.notify) client.loom.notify("huntstats");
