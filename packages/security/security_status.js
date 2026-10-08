if (!client.loom || !client.loom.security || !client.loom.security.items) run_function("security_setup", [], "security");
var SE = client.loom.security;
var seHouse = get_variable("security_house") || {};
display_notice("[security] antitheft " + String(get_variable("security_antitheft")).toUpperCase()
  + ", backpack " + (SE.backpack ? SE.backpack + (get_variable("security_backpack_desc") ? " (" + get_variable("security_backpack_desc") + ")" : " (no description: removal not watched)") : "not set")
  + ", " + SE.items.length + " item(s) watched, house " + (seHouse["in"] ? "set" : "not set")
  + ", selfishness " + (SE.selfish === null ? "unknown (DEF to check)" : SE.selfish ? "up" : "down") + ". SECURITY HELP for commands.", "cyan");
