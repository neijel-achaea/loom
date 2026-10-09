var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote breathes out long and heavy, pained.");
} else {
  send_command("sigh", 1);
}