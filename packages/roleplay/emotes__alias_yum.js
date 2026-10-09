var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote rumbles low and settles, thoroughly well fed.");
} else {
  send_command("emote rubs at his stomach, well fed and unashamed of it.");
}