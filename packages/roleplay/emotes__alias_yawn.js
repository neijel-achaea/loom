var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote  opens his jaws in an enormous yawn, every tooth on display.");
} else {
  send_command("emote opens his mouth in an enormous yawn.", 1);
}