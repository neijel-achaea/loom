var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote touches his muzzle briefly to $" + targetEmote + "'s cheek.");
} else {
  send_command("peck " + targetEmote, 1);
}