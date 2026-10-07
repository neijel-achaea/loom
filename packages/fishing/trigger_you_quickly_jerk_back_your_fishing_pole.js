var pause = get_variable("pauseTriggers");

if (pause == "off") {
  send_command("queue add  bal reel line");
} else {
  display_notice("[common] Triggers are currently paused.", "orange");
}