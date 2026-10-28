// loom: the suite package. Holds the LOOM command, the shared settings and,
// from v0.5, the integrations between packages. No package requires it.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.loom) client.loom.loom = {};
client.loom.registry.loom = { version: "1.0.3", keyword: "LOOM", desc: "{{description}}" };

// The legacy room variables loom used to set have no readers left: delete
// them once. activeClass is left for hunting and defcon to seed
// their own class from, and no longer updated.
var lmOld = ["currentRoomId", "currentRoomName", "currentArea", "currentEnvironment"];
for (var lmI = 0; lmI < lmOld.length; lmI++) {
  var lmV;
  try { lmV = get_variable(lmOld[lmI]); } catch (e) { lmV = undefined; }
  if (lmV !== undefined && lmV !== null) delete_variable(lmOld[lmI]);
}

set_variable("pauseTriggers", "off");

// Which packages are really installed (LOOM, LOOM UPDATES).
run_function("loom_packages", [], "loom");
// The integrations catalogue and the LOOM LINK switches.
run_function("loom_links", [], "loom");
// City themes for the tabs (#310): after the links, so redraws can run.
run_function("loom_theme", [], "loom");
// LOOM PERF (#209): ends any sample an earlier copy left running.
run_function("loom_perf", [], "loom");
// Integrations that write (ledger reminders, …) look at their source once.
client.loom.loom.updateAll();
// The two-line scripts' work (#136): made afresh, so a reimport replaces it.
run_function("loom_gmcp", [], "loom");
