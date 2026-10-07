var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote (Caught out,) winces and draws his wings in.");
} else {
  send_command("emote winces, caught out.", 1);
}