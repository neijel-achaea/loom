var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote laughs, the sound rolling out of him.");
} else {
  send_command("laugh", 1);
}