var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote lowers his great head toward $" + targetEmote + " and rumbles, low and warm.");
} else {
  send_command("aww " + targetEmote, 1);
}