var who = args[1];
var GROVE_ROOM = 23748;   // <-- your grove's room number
var pause = get_variable("pauseTriggers");

if (pause == "off") {
  if (client.hl) {
    if (!client.hl.city || !client.hl.city[who.toLowerCase()]) {
      send_command("tell " + who + " Sorry, you're not in my allowed list.");
    } else if (client.room !== GROVE_ROOM) {
      send_command("tell " + who + " Sorry, I'm not in my grove.");
    } else {
      send_command("grove gate " + who);   
      display_notice("[grove] portal opened for " + who, "cyan");
    }
  }
} else {
  display_notice("[common] Triggers are currently paused.", "orange");
}