var pause = get_variable("pauseTriggers");

if (pause == "off") {
  send_command("stand");
  send_command("queue add bal travel to oceana");
} else {
  display_notice("[common] Triggers are currently paused.", "orange");
}