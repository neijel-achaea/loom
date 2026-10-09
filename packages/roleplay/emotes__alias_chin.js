var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote looks slowly about himself, one talon tapping at his jaw.");
} else {
  send_command("chin", 1);
}