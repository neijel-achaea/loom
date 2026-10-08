// sigils_settle -- finalises the monolith waiting in S.await.
// No flame reading at this point means the flame line never showed: missing.
var S = client.loom.sigils;
var aw = S.await;
if (aw) {
  S.await = null;
  var fl = (aw.flame === undefined || aw.flame === null) ? -1 : aw.flame;
  S.flag = { id: aw.id, name: aw.name, months: aw.months, flame: fl };
  run_function("sigils_flag", [], "sigils");
}
