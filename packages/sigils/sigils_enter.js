// sigils_enter -- on every room change while watching: the room's monolith
// is to be probed. Every entry is re-probed; nothing is sent while paused.
// The probe itself goes out through sigils_send, which waits its turn.
var S = client.loom.sigils;
var here = S.room || {};
var rid = here.id;

if (get_variable("sigils_on") && get_variable("pauseTriggers") != "on" && rid !== null && rid !== undefined && rid !== "") {
  var key = String(rid);

  // A monolith read in the previous room is still waiting for a flame line
  // that never came: settle it as "no flame".
  run_function("sigils_settle", [], "sigils");

  var ign = get_variable("sigils_ignored") || {};
  S.pending = ign[key] ? null : { id: key, name: here.name || "?" };
  run_function("sigils_send", [], "sigils");
}
