var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote nudges $" + targetEmote + " with a wing, suggestively.");
} else {
  send_command("nudge " + targetEmote, 1);
}