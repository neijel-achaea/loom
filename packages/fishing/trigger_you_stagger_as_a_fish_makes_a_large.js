var pause = get_variable("pauseTriggers");

if (pause == "off") {
  setTimeout(() => send_command("jerk pole"), 1800);
} else {
  display_notice("[common] Triggers are currently paused.", "orange");
}