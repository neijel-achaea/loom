var pause = get_variable("pauseTriggers");

if (pause == "off") {
  setTimeout(() => send_command("reel line"), 100);
} else {
  display_notice("[common] Triggers are currently paused.", "orange");
}