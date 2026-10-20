// magi_pump -- one REFINE every 1.5s; waits while triggers are paused.
var MG = client.loom.magi;
if (MG.state === "refining") {
  if (get_variable("pauseTriggers") == "on") {
    MG.pumpT = setTimeout(function () { run_function("magi_pump", [], "magi"); }, 1500);
  } else if (!MG.queue.length) {
    send_command("inr all");
    display_notice("[magi] refine done.", "lime");
    MG.state = "idle";
  } else {
    send_command(MG.queue.shift());
    MG.pumpT = setTimeout(function () { run_function("magi_pump", [], "magi"); }, 1500);
  }
}
