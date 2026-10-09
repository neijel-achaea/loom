var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote draws a sharp breath, head rearing back in horror.");
} else {
  send_command("emote draws a sharp breath, horrified.", 1);
}