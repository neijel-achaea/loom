// A lesson request: accept it, unless the asker is on your enemies list
// (only checked when the social package is installed).
var who = args[1];
var skill = args[2];

if (get_variable("pauseTriggers") != "on") {
  var cvLook = client.loom.social && client.loom.social.look;
  if (cvLook && cvLook.inGroup && cvLook.inGroup(who, "enemies")) {
    display_notice("[civic] " + who + " is an enemy: not teaching.", "orange");
  } else {
    send_command("ok");
    display_notice("[civic] teaching " + skill + " to " + who, "cyan");
  }
} else {
  display_notice("[civic] triggers are paused: lesson request from " + who + " not answered.", "orange");
}
