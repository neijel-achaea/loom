var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote pokes $" + targetEmote + " with the tip of one talon.");
} else {
  send_command("emote pokes $" + targetEmote, 1);
}