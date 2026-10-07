var antitheft = get_variable("antitheft");

if (antitheft == 1) {
  send_command("wear ring617919");
  display_notice("[security] WARNING: Potential theft", "red");
}