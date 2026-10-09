// Balance from Char.Vitals, for a ritual under way: a step waiting for
// balance goes once a prompt shows it back after one showing it lost (or,
// for a say-like bounce with balance kept, two prompts later); a ritual
// held by paused triggers resumes; a step with no reply after 12 prompts
// stops the ritual.
var cjM = "";
var cjA = null;
try { cjM = args.gmcp_method; cjA = args.gmcp_args; } catch (e) { cjM = ""; }
if (cjM === "Char.Vitals" && cjA && client.loom && client.loom.conjuration && client.loom.conjuration.run) {
  if (typeof cjA === "string") { try { cjA = JSON.parse(cjA); } catch (e) { cjA = null; } }
  var CJ = client.loom.conjuration;
  var R = CJ.run;
  var cjB = cjA && String(cjA.bal) === "1";
  R.prompts = (R.prompts || 0) + 1;
  if (!cjB) R.sawLost = true;
  if (R.state === "bal" && cjB && R.sawLost) {
    run_function("conjuration_next", [], "conjuration");
  } else if (R.state === "retry" && cjB && (R.sawLost || R.prompts >= 2)) {
    R.state = "send";
    run_function("conjuration_step", [], "conjuration");
  } else if (R.state === "held" && get_variable("pauseTriggers") !== "on") {
    run_function("conjuration_step", [], "conjuration");
  } else if (R.state === "expect" && R.prompts > 12) {
    CJ.failWhy = "no reply from the game";
    run_function("conjuration_fail", [], "conjuration");
  }
}
