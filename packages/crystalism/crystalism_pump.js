// crystalism_pump -- one REFINE every 1.5s; waits while triggers are paused.
var CR = client.loom.crystalism;
if (CR.state === "refining") {
  if (get_variable("pauseTriggers") == "on") {
    CR.pumpT = setTimeout(function () { run_function("crystalism_pump", [], "crystalism"); }, 1500);
  } else if (!CR.queue.length) {
    send_command("inr all");
    display_notice("[crystalism] refine done.", "lime");
    CR.state = "idle";
  } else {
    send_command(CR.queue.shift());
    CR.pumpT = setTimeout(function () { run_function("crystalism_pump", [], "crystalism"); }, 1500);
  }
}
