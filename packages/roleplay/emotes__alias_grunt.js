var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote rumbles, committing to nothing.");
} else {
  send_command("emote grunts, committing to nothing.", 1);
}