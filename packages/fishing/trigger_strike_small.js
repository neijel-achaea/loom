// Sends "jerk pole" after 1.8s, unless Loom is paused (an unset flag counts as off).
if (get_variable("pauseTriggers") !== "on") {
  setTimeout(() => send_command("jerk pole"), 1800);
} else {
  display_notice("[fishing] paused (LOOM PAUSE): not sending jerk pole.", "orange");
}
