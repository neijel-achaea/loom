var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote laughs with $" + targetEmote + ", the sound rolling out of him.");
} else {
  send_command("laugh " + targetEmote, 1);
}