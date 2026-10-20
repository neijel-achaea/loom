// GG [amount]: take gold out of the backpack, all of it or that many
// sovereigns. Antitheft stays as it is: the withdrawal is marked as your own
// (SE.ownGold), so trigger_gold_out lets that one "You get N gold sovereigns
// from <backpack>." through instead of putting the gold back.
if (!client.loom || !client.loom.security || !client.loom.security.items) run_function("security_setup", [], "security");
var SE = client.loom.security;
if (!SE.backpack) {
  display_notice("[security] no backpack set. SECURITY BACKPACK <id> = <description>.", "orange");
} else {
  var seAmount = to_number(args[1]);
  SE.ownGold = { amount: seAmount > 0 ? seAmount : 0, at: Date.now() };
  send_command(seAmount > 0 ? "get " + seAmount + " sovereign from " + SE.backpack : "get sovereign from " + SE.backpack);
}
