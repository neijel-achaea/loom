var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote tips a wing dismissively, unconcerned.");
} else {
  send_command("emote waves it off, unconcerned.");
}