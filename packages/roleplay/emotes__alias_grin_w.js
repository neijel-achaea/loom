var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote draws his lips back from his teeth at $" + targetEmote + ", in something like a grin.");
} else {
  send_command("grin " + targetEmote, 1);
}