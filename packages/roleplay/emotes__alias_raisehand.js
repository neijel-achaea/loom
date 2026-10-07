var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote raises a foreclaw in the air.");
} else {
  send_command("raisehand", 1);
}