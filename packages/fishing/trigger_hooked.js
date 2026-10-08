// Sends "queue add bal reel line", unless Loom is paused (an unset flag counts as off).
if (get_variable("pauseTriggers") !== "on") {
  send_command("queue add bal reel line");
} else {
  display_notice("[fishing] paused (LOOM PAUSE): not sending queue add bal reel line.", "orange");
}
