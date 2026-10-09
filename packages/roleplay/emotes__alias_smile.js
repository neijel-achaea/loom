var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote softens, in what is unmistakably a smile.");
} else {
  send_command("smile", 1);
}