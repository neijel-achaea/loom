var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote beats his wings once, slow and deliberate, in approval.");
} else {
  send_command("applaud", 1);
}