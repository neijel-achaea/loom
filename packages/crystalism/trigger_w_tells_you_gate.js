var who = args[1];
var pause = get_variable("pauseTriggers");

if (pause == "off") {
  if (client.hl) {
    if (!client.hl.city || !client.hl.city[who.toLowerCase()]) {
      send_command("tell " + who + " Sorry, you're not in my allowed list.");
    } else {
      send_command("embed sonicportal " + who);   
      display_notice("[crystalism] portal opened for " + who, "cyan");
    }
  }
} else {
  display_notice("[common] Triggers are currently paused.", "orange");
}