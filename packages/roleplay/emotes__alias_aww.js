var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote lets out a low, warm rumble deep in his chest.");
} else {
  send_command("aww", 1);
}