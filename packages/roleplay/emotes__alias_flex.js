var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote spreads his wings to their full span and holds them there.");
} else {
  send_command("emote rolls his shoulders and holds a moment, unhurriedly impressive.");
}