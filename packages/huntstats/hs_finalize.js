// Close the current area bucket. Logs a session only if xp was gained.
// Then clears accumulators (keeps area / level / nl) so the next kill starts fresh.
if (client.track && client.track.firstXpAt && client.track.xp > 0 && (client.track.lastXpAt - client.track.firstXpAt) >= 60000) {
  var ms = client.track.lastXpAt - client.track.firstXpAt;
  var hrs = ms / 3600000;
  var xpHr = Math.round(client.track.xp / hrs);
  var goldHr = Math.round(client.track.gold / hrs);

  run_function("hs_ensureTable", [], "huntstats");
  var ep = null;
  if (client.track.level !== undefined && client.track.nl !== undefined && client.dragonXP[Math.floor(client.track.level)] !== undefined) {
    var l = Math.floor(client.track.level);
    if (l >= 99) { ep = 100; }
    else { var b = client.dragonXP[l], n = client.dragonXP[l + 1]; ep = ((b + (client.track.nl / 100) * (n - b)) / client.dragonXP[99]) * 100; }
  }
  var dGain = (ep !== null && client.track.startDragonPct !== null && client.track.startDragonPct !== undefined) ? (ep - client.track.startDragonPct) : null;

  var players = [];
  for (var k in client.track.players) { if (client.track.players.hasOwnProperty(k)) { players.push(k); } }

  var rec = { area: client.track.area, xp: client.track.xp, gold: client.track.gold,
              kills: client.track.kills || 0, ms: ms, xpHr: xpHr, goldHr: goldHr,
              dGain: dGain, players: players, at: Date.now() };

  var log = [];
  try { log = JSON.parse(get_variable("hs_log")) || []; } catch (e) { log = []; }
  log.unshift(rec);
  if (log.length > 5) { log = log.slice(0, 5); }
  set_variable("hs_log", JSON.stringify(log));

  var areas = {};
  try { areas = JSON.parse(get_variable("hs_areas")) || {}; } catch (e) { areas = {}; }
  var a = areas[rec.area] || { xp: 0, gold: 0, kills: 0, ms: 0, sessions: 0 };
  a.xp += rec.xp; a.gold += rec.gold; a.kills += rec.kills; a.ms += rec.ms; a.sessions += 1;
  areas[rec.area] = a;
  set_variable("hs_areas", JSON.stringify(areas));

  var mins = Math.floor(ms / 60000);
  var dur = Math.floor(mins / 60) + "h " + (mins % 60) + "m";
  var extra = (dGain !== null) ? (", +" + dGain.toFixed(3) + "% dragon") : "";
  display_notice("[huntstats] " + rec.area + ": " + rec.xp.toLocaleString() + " xp (" + xpHr.toLocaleString() + "/hr), " + rec.gold.toLocaleString() + " gold, " + rec.kills + " kills, " + dur + extra, "cyan");
  // send_command("pt [huntstats] " + rec.area + ": " + rec.xp.toLocaleString() + " xp (" + xpHr.toLocaleString() + "/hr), " + rec.gold.toLocaleString() + " gold, " + rec.kills + " kills, " + dur + extra);
  run_function("hs_render", [], "huntstats");
}

// always reset accumulators + clear the open-session checkpoint
if (client.track) {
  client.track.xp = 0; client.track.gold = 0; client.track.kills = 0;
  client.track.firstXpAt = 0; client.track.lastXpAt = 0;
  client.track.startDragonPct = null; client.track.players = {};
}
client.hsLastSave = 0;
try { set_variable("hs_open", ""); } catch (e) {}