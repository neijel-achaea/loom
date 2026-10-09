var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote turns his head and fixes $" + targetEmote + " with an unblinking stare.");
} else {
  send_command("emote fixes $" + targetEmote + " with a long, level stare.");
}