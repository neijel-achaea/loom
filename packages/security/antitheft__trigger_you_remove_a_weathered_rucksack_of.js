var antitheft = get_variable("antitheft");

if (antitheft == 1) {
  send_command("wear rucksack329295");
  display_notice("[security] WARNING: Potential theft", "red");
}