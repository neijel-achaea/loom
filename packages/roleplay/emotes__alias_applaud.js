var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote beats his wings once, slow and deliberate, in approval.");
} else {
  send_command("applaud", 1);
}