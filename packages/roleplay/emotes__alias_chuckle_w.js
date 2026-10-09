var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote chuckles at $" + targetEmote + ", the sound turning over deep in his chest.");
} else {
  send_command("chuckle " + targetEmote, 1);
}