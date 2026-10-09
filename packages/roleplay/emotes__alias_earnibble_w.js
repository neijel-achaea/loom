var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote brings his jaws close and breathes warm against $" + targetEmote + "'s ear");
} else {
  send_command("earnibble " + targetEmote, 1);
}