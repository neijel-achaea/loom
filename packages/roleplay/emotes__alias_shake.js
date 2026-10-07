var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote shakes his head, slow and heavy.");
} else {
  send_command("shake", 1);
}