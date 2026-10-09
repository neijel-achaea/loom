var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote draws the back of one talon along $" + targetEmote + "'s cheek, careful as anything.");
} else {
  send_command("emote brushes his fingers along $" + targetEmote + "'s cheek, unhurried.");
}