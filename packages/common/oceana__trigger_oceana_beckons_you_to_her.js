var pause = get_variable("pauseTriggers");

if (pause == "off") {
  send_command("stand up");
  send_command("queue add bal follow oceana");
} else {
  display_notice("[common] Triggers are currently paused.", "orange");
}