var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote rumbles low, frankly approving.");
} else {
  send_command("emote makes a low sound of frank approval.", 1);
}