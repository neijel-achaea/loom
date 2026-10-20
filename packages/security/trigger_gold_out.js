// "You get N gold sovereigns from <backpack>." while antitheft is on: put it
// back, unless it's the answer to your own GG (SE.ownGold, set there: any
// amount up to what you asked for, within a few seconds, once).
if (!client.loom || !client.loom.security || !client.loom.security.items) run_function("security_setup", [], "security");
var SE = client.loom.security;
var seGot = to_number(args[1]);
var seOwn = SE.ownGold;
if (seOwn && args[2] == get_variable("security_backpack_desc")) SE.ownGold = null;
var seMine = !!seOwn && Date.now() - seOwn.at < SE.ownGoldMs && (!seOwn.amount || seGot <= seOwn.amount);
if (!seMine && get_variable("security_antitheft") == "on" && SE.backpack && args[2] == get_variable("security_backpack_desc")) {
  send_command("put sovereign in " + SE.backpack);
  display_notice("[security] WARNING: potential theft (gold out of the backpack).", "red");
}
