// For triggers: set client.loom.standings.sug = { who: "Name", step: -3, why: "tried to
// steal from you" } and run this. It queues the dealing for review instead of
// recording it, since a standing is a judgement call; STANDINGS OK records it.
run_function("standings_ensure", [], "standings");
var F = client.loom.standings.F;
var sg = client.loom.standings.sug;
client.loom.standings.sug = null;
if (sg && sg.who) {
  var now = Math.floor(new Date().getTime() / 1000);
  var P = client.loom.standings.db.pending;
  var who = F.proper(sg.who);
  var why = String(sg.why || "something happened");
  var step = parseInt(sg.step, 10) || 0;
  // A burst of the same event (several theft attempts in a row) queues once.
  var dupe = false;
  for (var i = 0; i < P.length; i++) { if (P[i].who === who && P[i].why === why && now - P[i].t < 120) { dupe = true; } }
  if (!dupe) {
    P.push({ t: now, ic: F.ic(now), who: who, why: why, step: step });
    while (P.length > 20) { P.shift(); }
    F.save();
    display_notice("[standings] review: " + who + " — " + why + " (suggested " + F.steps(step) + "). STANDINGS OK to record, STANDINGS SKIP to dismiss.", "cyan");
    run_function("standings_render", [], "standings");
  }
}