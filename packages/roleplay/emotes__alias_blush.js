var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote (Vapour hissing thin between his teeth,) draws his wings in tight and turns his head away.");
} else {
  send_command("blush", 1);
}