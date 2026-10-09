var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote comes up behind $" + targetEmote + " and closes a wing around $" + targetEmote + "_him before $" + targetEmote + "_he can turn.");
} else {
  send_command("hugbehind " + targetEmote, 1);
}