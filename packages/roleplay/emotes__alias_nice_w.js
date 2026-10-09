var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote rumbles low at $" + targetEmote + ", frankly approving.");
} else {
  send_command("emote makes a low sound of frank approval at $" + targetEmote);
}