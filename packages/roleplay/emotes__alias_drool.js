var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote (A single drop falls from) 's jaws, hissing into smoke before it lands.");
} else {
  send_command("emote catches the scent of something and swallows, plainly hungry.");
}