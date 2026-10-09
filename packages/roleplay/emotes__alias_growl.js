var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote growls, low and building, until the ground takes it up.");
} else {
  send_command("emote growls low in his throat.", 1);
}