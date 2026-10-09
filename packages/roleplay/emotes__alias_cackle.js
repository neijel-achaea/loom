var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote cackles ominously, spoiling it entirely with a grin.");
} else {
  send_command("emote attempts a sinister cackle, and does not entirely succeed.");
}