var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote rumbles, committing to nothing.");
} else {
  send_command("emote grunts, committing to nothing.", 1);
}