// PG: put gold back in the backpack and turn antitheft on.
if (!client.loom || !client.loom.security || !client.loom.security.items) run_function("security_setup", [], "security");
var SE = client.loom.security;
if (!SE.backpack) {
  display_notice("[security] no backpack set. SECURITY BACKPACK <id> = <description>.", "orange");
} else {
  send_command("put gold in " + SE.backpack);
  set_variable("security_antitheft", "on");
}
