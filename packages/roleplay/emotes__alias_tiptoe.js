var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote attempts to slip quietly away, with limited success.");
} else {
  send_command("emote attempts to slip quietly away, hoping not to be noticed.");
}