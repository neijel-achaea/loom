var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote releases a held breath, acrid and hissing, that stings faintly in the air.");
} else {
  send_command("exhale", 1);
}