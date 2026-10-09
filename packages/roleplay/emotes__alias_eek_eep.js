var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote flinches back with a snap of wings, thoroughly startled.");
} else {
  send_command("emote startles badly, a hand going to his chest.");
}