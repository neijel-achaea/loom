var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote huffs at $" + targetEmote + ", unimpressed.");
} else {
  send_command("emote makes a short, dismissive sound at $" + targetEmote);
}