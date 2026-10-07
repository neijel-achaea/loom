// For triggers: set client.stSug = { who: "Name", step: -3, why: "tried to
// steal from you" } and run this. It queues the dealing for review instead of
// recording it, since a standing is a judgement call; STN OK records it.
run_function("st_ensure", [], "standings");
var F = client.stF;
var sg = client.stSug;
client.stSug = null;
if (sg && sg.who) {
  var now = Math.floor(new Date().getTime() / 1000);
  var P = client.st.db.pending;
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
    display_notice("[standings] review: " + who + " — " + why + " (suggested " + F.steps(step) + "). STN OK to record, STN SKIP to dismiss.", "#c9b6e8");
    run_function("st_render", [], "standings");
  }
}