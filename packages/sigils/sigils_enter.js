// sigils_enter -- on every room change while watching: queue the room and
// probe its monolith. Every entry is re-probed; nothing is sent while paused.
var S = client.loom.sigils;
var here = S.room || {};
var rid = here.id;

if (get_variable("sigils_on") && get_variable("pauseTriggers") != "on" && rid !== null && rid !== undefined && rid !== "") {
  var key = String(rid);

  // A monolith read in the previous room is still waiting for a flame line
  // that never came: settle it as "no flame".
  run_function("sigils_settle", [], "sigils");

  var ign = get_variable("sigils_ignored") || {};
  if (!ign[key]) {
    if (!S.queue) S.queue = [];
    S.queue.push({ id: key, name: here.name || "?", t: Date.now() });
    if (S.queue.length > 20) S.queue = S.queue.slice(S.queue.length - 20);
    send_command("probe monolith here");
  }
}
