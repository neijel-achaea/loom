var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote raises a foreclaw in the air.");
} else {
  send_command("raisehand", 1);
}