var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote rasps a talon against his brow ridge, casting about for an idea.");
} else {
  send_command("think", 1);
}