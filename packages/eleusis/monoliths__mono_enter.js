// mono_enter -- called on every room change (wired from onGMCP).
// Queues the room and probes it. No dedupe buffer: every entry is re-probed.
var rid = get_variable("currentRoomId");
var rnm = get_variable("currentRoomName");
if ((rid === null || rid === undefined) && typeof currentRoomId !== "undefined") rid = currentRoomId;
if ((rnm === null || rnm === undefined) && typeof currentRoomName !== "undefined") rnm = currentRoomName;

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
