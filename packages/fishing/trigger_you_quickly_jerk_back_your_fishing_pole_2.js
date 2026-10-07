var pause = get_variable("pauseTriggers");

if (pause == "off") {
  setTimeout(() => send_command("tease line"), 3000);
} else {
  display_notice("[common] Triggers are currently paused.", "orange");
}