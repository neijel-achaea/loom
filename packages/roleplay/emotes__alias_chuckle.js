var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote chuckles, the sound turning over deep in his chest.");
} else {
  send_command("chuckle", 1);
}