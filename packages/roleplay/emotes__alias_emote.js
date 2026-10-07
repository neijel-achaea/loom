var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote x");
} else {
  send_command("y", 1);
}