var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote draws his lips back from his teeth in something like a grin.");
} else {
  send_command("grin", 1);
}