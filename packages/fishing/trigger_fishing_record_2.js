var pause = get_variable("pauseTriggers");

if (pause == "off") {
  send_command("partytell Ding fish!");
} else {
  display_notice("[common] Triggers are currently paused.", "orange");
}