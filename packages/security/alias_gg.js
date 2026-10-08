// GG: take gold out of the backpack (antitheft off so it isn't put straight back).
if (!client.loom || !client.loom.security || !client.loom.security.items) run_function("security_setup", [], "security");
var SE = client.loom.security;
if (!SE.backpack) {
  display_notice("[security] no backpack set. SECURITY BACKPACK <id> | <description>.", "orange");
} else {
  set_variable("security_antitheft", "off");
  send_command("get sovereign from " + SE.backpack);
}
