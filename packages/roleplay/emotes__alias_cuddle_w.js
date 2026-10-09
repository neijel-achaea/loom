var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote bumps his head against $" + targetEmote + ", companionable.");
} else {
  send_command("emote pulls $" + targetEmote + " into a brief, friendly cuddle.");
}