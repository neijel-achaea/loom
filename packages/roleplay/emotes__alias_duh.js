var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote goes still, the obvious answer arriving rather late.");
} else {
  send_command("emote stops short, the obvious answer arriving rather late.");
}