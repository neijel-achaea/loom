var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote sweeps one wing wide and lowers his forequarters to the ground.");
} else {
  send_command("bow", 1);
}