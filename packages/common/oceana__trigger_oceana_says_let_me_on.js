var pause = get_variable("pauseTriggers");

if (pause == "off") {
  send_command("say let me on");
} else {
  display_notice("[common] Triggers are currently paused.", "orange");
}