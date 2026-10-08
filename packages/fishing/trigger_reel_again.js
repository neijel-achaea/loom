// Sends "reel line" after 0.1s, unless Loom is paused (an unset flag counts as off).
if (get_variable("pauseTriggers") !== "on") {
  setTimeout(() => send_command("reel line"), 100);
} else {
  display_notice("[fishing] paused (LOOM PAUSE): not sending reel line.", "orange");
}
