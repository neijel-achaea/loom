// conjuration_gmcp -- the work behind onGMCP, as a function made once per load
// (client.loom.hooks.conjuration.gmcp). Nexus compiles a script afresh every time it
// runs, and long ones cost on every GMCP message, so the script itself stays two
// lines and calls this (#136). Run from onLoad and onInstall, so a reimport
// replaces it.
if (!client.loom) client.loom = {};
if (!client.loom.hooks) client.loom.hooks = {};
if (!client.loom.hooks.conjuration) client.loom.hooks.conjuration = {};
client.loom.hooks.conjuration.gmcp = function (args) {
  // Balance from Char.Vitals, for a ritual under way: a step waiting for
  // balance goes once a prompt shows it back after one showing it lost (or,
  // for a say-like bounce with balance kept, two prompts later); a ritual
  // held by paused triggers resumes; a step with no reply after 12 prompts
  // stops the ritual.
  var cjM = "";
  var cjA = null;
  try { cjM = args.gmcp_method; cjA = args.gmcp_args; } catch (e) { cjM = ""; }
  if (cjM === "Char.Defences.List" || cjM === "Char.Defences.Add" || cjM === "Char.Defences.Remove") {
    var cjD = args.gmcp_args;
    if (typeof cjD === "string") { try { cjD = JSON.parse(cjD); } catch (e) { cjD = null; } }
    if (client.loom && client.loom.conjuration && cjD && typeof cjD == "object") {
      var cjC = client.loom.conjuration;
      if (cjM === "Char.Defences.List" && cjD.length !== undefined) {
        cjC.selfish = false;
        for (var cjI = 0; cjI < cjD.length; cjI++) { if (cjD[cjI] && cjD[cjI].name == "selfishness") cjC.selfish = true; }
      } else if (cjM === "Char.Defences.Add" && cjD.name == "selfishness") {
        cjC.selfish = true;
      } else if (cjM === "Char.Defences.Remove" && cjD.length !== undefined) {
        for (var cjJ = 0; cjJ < cjD.length; cjJ++) { if (cjD[cjJ] == "selfishness") cjC.selfish = false; }
      }
    }
  }
  if (cjM === "Char.Vitals" && cjA && client.loom && client.loom.conjuration && client.loom.conjuration.run) {
    if (typeof cjA === "string") { try { cjA = JSON.parse(cjA); } catch (e) { cjA = null; } }
    var CJ = client.loom.conjuration;
    var R = CJ.run;
    var cjB = cjA && String(cjA.bal) === "1";
    var cjE = cjA && String(cjA.eq) === "1";
    var cjSt = R.steps[R.i] || {};
    R.prompts = (R.prompts || 0) + 1;
    if (!cjB) R.sawLost = true;
    if (R.state === "rift" && R.prompts >= 1) {
      // The prompt after the rift list (or after a rift with no commodities).
      run_function("conjuration_riftcheck", [], "conjuration");
    } else if (R.state === "bal" && cjSt.eq) {
      // Generosity and selfishness: on as soon as a prompt shows equilibrium.
      if (cjE) run_function("conjuration_next", [], "conjuration");
    } else if (R.state === "bal" && cjB && R.sawLost) {
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
};
