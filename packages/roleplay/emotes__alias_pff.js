var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote huffs, short and dismissive.");
} else {
  send_command("emote makes a short, dismissive sound.", 1);
}