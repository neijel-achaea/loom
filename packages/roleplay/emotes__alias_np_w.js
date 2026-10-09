var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote tips a wing at $" + targetEmote + ", unconcerned. \"It was nothing.\"");
} else {
  send_command("emote waves $" + targetEmote + " off. \"It was nothing.\"");
}