var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote traces his muzzle up the line of $" + targetEmote + "'s neck and rests it at the base of $" + targetEmote + "_his jaw.");
} else {
  send_command("neckkiss " + targetEmote, 1);
}