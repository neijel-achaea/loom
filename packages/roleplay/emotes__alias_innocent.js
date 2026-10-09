var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote hums to himself, deep and tuneless, the picture of innocence.");
} else {
  send_command("innocent", 1);
}