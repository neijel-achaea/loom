var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote comes over to $" + targetEmote + ", a little bashful, and nuzzles his muzzle against $" + targetEmote + "_him.");
} else {
  send_command("nuzzle " + targetEmote, 1);
}