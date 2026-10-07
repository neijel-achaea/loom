var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote breathes out long and heavy, pained.");
} else {
  send_command("sigh", 1);
}