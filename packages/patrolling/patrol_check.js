var pause = get_variable("pauseTriggers");

if (pause == "off") {
  var p = client.patrol;
  if (p) {
    p.present = []; p.shrines = []; p.active = true; p.gag = false;
    send_command("PLANTS", 1);
    send_command("INFO HERE", 1);
  }
} else {
  display_notice("[common] Triggers are currently paused.", "orange");
}