var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote sweeps $" + targetEmote + " behind him and lowers his head at what stands before them.");
} else {
  send_command("emote takes hold of $" + targetEmote + "'s arm and puts himself between $" + targetEmote + "_him and the rest of the world.");
}