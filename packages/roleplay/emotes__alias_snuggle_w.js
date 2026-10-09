var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote curls himself around $" + targetEmote + " and settles, content.");
} else {
  send_command("snuggle " + targetEmote, 1);
}