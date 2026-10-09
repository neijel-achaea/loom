var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote lets his wings sag, plainly relieved.");
} else {
  send_command("phew", 1);
}