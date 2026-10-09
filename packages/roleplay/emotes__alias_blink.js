var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote blinks, thin membranes sliding once across his eyes.");
} else {
  send_command("blink", 1);
}