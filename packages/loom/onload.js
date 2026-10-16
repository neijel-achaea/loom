// loom: the suite package. Holds the LOOM command, the shared settings and,
// from v0.5, the integrations between packages. No package requires it.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.loom) client.loom.loom = {};
client.loom.registry.loom = { version: "0.4.25", keyword: "LOOM", desc: "{{description}}" };

// The legacy room variables loom used to set have no readers left: delete
// them once. activeClass is left for hunting, defcon and roleplay to seed
// their own class from, and no longer updated.
var lmOld = ["currentRoomId", "currentRoomName", "currentArea", "currentEnvironment"];
for (var lmI = 0; lmI < lmOld.length; lmI++) {
  var lmV;
  try { lmV = get_variable(lmOld[lmI]); } catch (e) { lmV = undefined; }
  if (lmV !== undefined && lmV !== null) delete_variable(lmOld[lmI]);
}

set_variable("pauseTriggers", "off");

// The integrations catalogue and the LOOM LINK switches.
run_function("loom_links", [], "loom");
// Integrations that write (ledger reminders, …) look at their source once.
client.loom.loom.updateAll();
