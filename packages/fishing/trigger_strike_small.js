// Sends "jerk pole" after 1.8s, unless Loom is paused (an unset flag counts as off).
if (!client.loom || !client.loom.fishing || !client.loom.fishing.later) run_function("fishing_setup", [], "fishing");
if (get_variable("pauseTriggers") !== "on") {
  client.loom.fishing.later("jerk pole", 1800);
} else {
  display_notice("[fishing] paused (LOOM PAUSE): not sending jerk pole.", "orange");
}
