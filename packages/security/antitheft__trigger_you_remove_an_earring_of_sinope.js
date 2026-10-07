var antitheft = get_variable("antitheft");

if (antitheft == 1) {
  send_command("wear earring429811 left ear");
  display_notice("[security] WARNING: Potential theft", "red");
}