// Sends "tease line" after 2.1s, unless Loom is paused (an unset flag counts as off).
if (get_variable("pauseTriggers") !== "on") {
  setTimeout(() => send_command("tease line"), 2100);
} else {
  display_notice("[fishing] paused (LOOM PAUSE): not sending tease line.", "orange");
}
