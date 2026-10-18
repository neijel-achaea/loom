// Sends "tease line" after 2.1s, unless Loom is paused (an unset flag counts as off).
// A nibble means a baited line is out, so a re-baited hook (FISHING REBAIT) has
// been used, even if the cast was typed by hand: the next CL baits again.
if (client.loom && client.loom.fishing) client.loom.fishing.baited = false;
if (get_variable("pauseTriggers") !== "on") {
  setTimeout(() => send_command("tease line"), 2100);
} else {
  display_notice("[fishing] paused (LOOM PAUSE): not sending tease line.", "orange");
}
