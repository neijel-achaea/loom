var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote lifts a wing in farewell and holds it there a moment.");
} else {
  send_command("emote raises a hand in farewell and holds it a moment.");
}