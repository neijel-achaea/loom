var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote recoils, lips curling back from his teeth.");
} else {
  send_command("emote draws back with an expression of frank distaste.");
}