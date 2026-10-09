var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote flicks the tip of his tail across $" + targetEmote + "'s backside, then looks innocently elsewhere.");
} else {
  send_command("pinch " + targetEmote, 1);
}