var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote narrows his eyes to slits, unconvinced.");
} else {
  send_command("frown", 1);
}