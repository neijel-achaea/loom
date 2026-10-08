// A lesson request: accept it, unless the asker is on your enemies list
// (only checked when the social package is installed).
var who = args[1];
var skill = args[2];

if (get_variable("pauseTriggers") != "on") {
  var hl = client.hl;
  if (hl && hl.enemies && hl.enemies[String(who).toLowerCase()]) {
    display_notice("[civic] " + who + " is an enemy: not teaching.", "orange");
  } else {
    send_command("ok");
    display_notice("[civic] teaching " + skill + " to " + who, "cyan");
  }
} else {
  display_notice("[civic] triggers are paused: lesson request from " + who + " not answered.", "orange");
}
