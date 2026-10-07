var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote inclines his head, grateful.");
} else {
  send_command("emote inclines his head, grateful.", 1);
}