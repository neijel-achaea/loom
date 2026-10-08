// "You get N gold sovereigns from <backpack>." while antitheft is on: put it back.
if (!client.loom || !client.loom.security || !client.loom.security.items) run_function("security_setup", [], "security");
var SE = client.loom.security;
if (get_variable("security_antitheft") == "on" && SE.backpack && args[2] == get_variable("security_backpack_desc")) {
  send_command("put sovereign in " + SE.backpack);
  display_notice("[security] WARNING: potential theft (gold out of the backpack).", "red");
}
