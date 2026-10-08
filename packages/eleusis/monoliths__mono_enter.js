// mono_enter -- called from this package's own onGMCP on every room change.
// Queues the room and probes it. No dedupe buffer: every entry is re-probed.
var here = (client.loom && client.loom.eleusis && client.loom.eleusis.room) || {};
var rid = here.id;
var rnm = here.name;

if (get_variable("mono_on") && rid !== null && rid !== undefined && rid !== "") {
  var key = String(rid);

  // A monolith read in the previous room is waiting for a flame line that
  // never came -- settle it now as "no flame".
  run_function("mono_settle", [], "eleusis");

  var ign = get_variable("mono_ignore");
  if (!ign) { ign = { "6742": "?" }; set_variable("mono_ignore", ign); }

  if (!ign[key]) {
    var q = get_variable("mono_queue") || [];
    q.push({ id: key, name: rnm || "?", t: Date.now() });
    if (q.length > 20) q = q.slice(q.length - 20);
    set_variable("mono_queue", q);
    send_command("probe monolith here");
  }
}
