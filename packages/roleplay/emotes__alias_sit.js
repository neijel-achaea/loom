var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote settles onto his haunches.");
} else {
  send_command("sit", 1);
}