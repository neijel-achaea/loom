var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote softens at $" + targetEmote + ", unmistakably pleased.");
} else {
  send_command("smile " + targetEmote, 1);
}