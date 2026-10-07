var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote blinks, thin membranes sliding once across his eyes.");
} else {
  send_command("blink", 1);
}