var who = args[1];
var skill = args[2];
var pause = get_variable("pauseTriggers");

if (pause == "off") {
  if (client.hl) {
    if (client.hl.enemies[who.toLowerCase()]) {
      display_notice("[eleusis] You cannot teach enemies!", "orange");
    } else {
      send_command("ok");   
      display_notice("[eleusis] teaching " + skill + " to " + who, "cyan");
    }
  }
} else {
  display_notice("[common] Triggers are currently paused.", "orange");
}