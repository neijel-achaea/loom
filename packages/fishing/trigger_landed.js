// A fish landed. With FISHING REBAIT ON, bait the hook again (on balance) so
// the next CL only has to cast. Never casts: the next cast stays the player's.
if (!client.loom || !client.loom.fishing) run_function("fishing_setup", [], "fishing");
var FI = client.loom.fishing;
var fiBait = get_variable("fishing_bait");
if (get_variable("fishing_rebait") === "on" && fiBait) {
  if (get_variable("pauseTriggers") !== "on") {
    send_command("queue add bal bait hook with " + fiBait);
    FI.baited = true;
  } else {
    display_notice("[fishing] paused (LOOM PAUSE): not re-baiting the hook.", "orange");
  }
}
