// Sends "tease line" after 3.0s, unless Loom is paused (an unset flag counts as off).
if (get_variable("pauseTriggers") !== "on") {
  setTimeout(() => send_command("tease line"), 3000);
} else {
  display_notice("[fishing] paused (LOOM PAUSE): not sending tease line.", "orange");
}
