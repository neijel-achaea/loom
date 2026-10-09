var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote releases a held breath, acrid and hissing, that stings faintly in the air.");
} else {
  send_command("exhale", 1);
}