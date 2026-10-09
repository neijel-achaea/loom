var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote points a talon at $" + targetEmote);
} else {
  send_command("emote points a finger at $" + targetEmote);
}