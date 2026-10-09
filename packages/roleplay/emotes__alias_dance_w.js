var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote coils about $" + targetEmote + " in a slow turn, graceful past all reason for his bulk.");
} else {
  send_command("dance " + targetEmote, 1);
}