var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote bows low before $" + targetEmote + ", wings folded and head held down a moment.");
} else {
  send_command("bow " + targetEmote, 1);
}