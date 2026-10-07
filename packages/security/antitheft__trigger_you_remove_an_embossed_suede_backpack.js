var antitheft = get_variable("antitheft");
var backpack = get_variable("backpack");

if (antitheft == 1) {
  send_command("wear " + backpack);
  display_notice("[security] WARNING: Potential theft", "red");
}