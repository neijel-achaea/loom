// Files the current session into the log and starts a blank one. A session
// with nothing landed is discarded rather than logged.
run_function("fsh_ensure", [], "fishingstats");
var s = client.fsh;
if (s.n > 0) {
  var ang = {};
  var sp = {};
  var k;
  for (k in s.anglers) {
    if (s.anglers.hasOwnProperty(k)) {
      var a = s.anglers[k];
      ang[k] = [a.n, a.oz, a.best, a.casts || 0, a.hooks || 0, a.bestSp || ""];
    }
  }
  for (k in s.species) {
    if (s.species.hasOwnProperty(k)) { sp[k] = [s.species[k].n, s.species[k].best, s.species[k].bestBy]; }
  }
  var areas = [];
  for (k in s.areas) { if (s.areas.hasOwnProperty(k)) { areas.push(k); } }
  client.fshLog.push({
    s: s.start, e: s.last, ar: areas.join(", "), y: s.year || 0,
    n: s.n, oz: 0, rec: s.rec || 0,
    ft: s.castN > 0 ? Math.round(s.castFt / s.castN) : 0,
    ang: ang, sp: sp
  });
  var tot = 0;
  for (k in s.anglers) { if (s.anglers.hasOwnProperty(k)) { tot += s.anglers[k].oz; } }
  client.fshLog[client.fshLog.length - 1].oz = tot;
  while (client.fshLog.length > client.fshLogCap) { client.fshLog.shift(); }
  try { set_variable("fsh_log", JSON.stringify(client.fshLog)); } catch (e) {}
}
var now = Math.floor(new Date().getTime() / 1000);
client.fsh = { start: now, last: now, anglers: {}, species: {}, recent: [], n: 0, areas: {}, year: client.fshRec.year || 0, rec: 0, castFt: 0, castN: 0 };
try { set_variable("fsh_session", JSON.stringify(client.fsh)); } catch (e) {}
run_function("fsh_render", [], "fishingstats");
run_function("fsh_log_render", [], "fishingstats");