var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote snaps his jaws shut with a crack and rumbles in delight.");
} else {
  send_command("boo", 1);
}