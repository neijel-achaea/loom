var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote breathes out long and low, and lets his eyes drift half shut, content.");
} else {
  send_command("emote lets out a slow breath, thoroughly content.");
}