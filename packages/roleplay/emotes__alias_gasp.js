var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote draws a sharp breath, head rearing back in horror.");
} else {
  send_command("emote draws a sharp breath, horrified.", 1);
}