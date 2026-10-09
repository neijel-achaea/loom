var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote runs his muzzle slowly along $" + targetEmote + "'s shoulder and up the side of $" + targetEmote + "_his neck.");
} else {
  send_command("massage " + targetEmote, 1);
}