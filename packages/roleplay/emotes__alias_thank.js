var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote inclines his head, grateful.");
} else {
  send_command("emote inclines his head, grateful.", 1);
}