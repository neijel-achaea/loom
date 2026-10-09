var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote lowers his head and presses his brow to $" + targetEmote + "'s, breath warm between them.");
} else {
  send_command("kiss " + targetEmote, 1);
}