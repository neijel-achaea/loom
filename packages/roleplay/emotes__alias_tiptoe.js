var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote attempts to slip quietly away, with limited success.");
} else {
  send_command("emote attempts to slip quietly away, hoping not to be noticed.");
}