var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote sets his talons into the ground and lets the smoke build behind his teeth.");
} else {
  send_command("emote closes his fists slowly and says nothing at all.");
}