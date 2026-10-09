var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote lifts a foreclaw and lets $" + targetEmote + " strike $" + targetEmote + "_his palm against it.");
} else {
  send_command("emote swings his arm up and claps his palm to $" + targetEmote + "'s, grinning.");
}