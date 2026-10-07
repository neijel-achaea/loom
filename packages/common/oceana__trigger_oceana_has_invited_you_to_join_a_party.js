var pause = get_variable("pauseTriggers");

if (pause == "off") {
  send_command("party accept");

} else {
  display_notice("[common] Triggers are currently paused.", "orange");
}