var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote (Caught out,) winces and draws his wings in.");
} else {
  send_command("emote winces, caught out.", 1);
}