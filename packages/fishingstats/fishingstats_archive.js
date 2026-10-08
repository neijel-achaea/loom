// Files the current session into the log and starts a blank one. A session
// with nothing landed is discarded rather than logged.
if (!client.loom || !client.loom.fishingstats || !client.loom.fishingstats.session) run_function("fishingstats_setup", [], "fishingstats");
var FS = client.loom.fishingstats;
var s = FS.session;
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
  FS.log.push({
    s: s.start, e: s.last, ar: areas.join(", "), y: s.year || 0,
    n: s.n, oz: 0, rec: s.rec || 0,
    ft: s.castN > 0 ? Math.round(s.castFt / s.castN) : 0,
    ang: ang, sp: sp
  });
  var tot = 0;
  for (k in s.anglers) { if (s.anglers.hasOwnProperty(k)) { tot += s.anglers[k].oz; } }
  FS.log[FS.log.length - 1].oz = tot;
  while (FS.log.length > FS.logCap) { FS.log.shift(); }
  try { set_variable("fishingstats_log", JSON.stringify(FS.log)); } catch (e) {}
}
var now = Math.floor(new Date().getTime() / 1000);
FS.session = { start: now, last: now, anglers: {}, species: {}, recent: [], n: 0, areas: {}, year: FS.rec.year || 0, rec: 0, castFt: 0, castN: 0 };
try { set_variable("fishingstats_session", JSON.stringify(FS.session)); } catch (e) {}
run_function("fishingstats_render", [], "fishingstats");
run_function("fishingstats_log_render", [], "fishingstats");