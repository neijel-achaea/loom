// A fish landed: the bait is gone and nothing still waiting should go out.
// With FISHING REBAIT ON, bait the hook again (on balance) so the next CL only
// casts; the game's "You carefully thread …" line then marks the hook baited.
// Never casts: the next cast stays the player's.
if (!client.loom || !client.loom.fishing || !client.loom.fishing.cancel) run_function("fishing_setup", [], "fishing");
var FI = client.loom.fishing;
FI.cancel();
FI.baited = false;
var fiBait = get_variable("fishing_bait");
if (get_variable("fishing_rebait") === "on" && fiBait) {
  if (get_variable("pauseTriggers") !== "on") {
    send_command("queue add bal bait hook with " + fiBait);
  } else {
    display_notice("[fishing] paused (LOOM PAUSE): not re-baiting the hook.", "orange");
  }
}
