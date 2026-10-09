// ledger_check -- fire notices for anything now due, then refresh the tab.
if (!client.loom || !client.loom.ledger || !client.loom.ledger.months) run_function("ledger_setup", [], "ledger");
var items = [];
try { items = JSON.parse(get_variable("ledger_items")) || []; } catch (e) { items = []; }
var today = client.loom.ledger.day;
var dirty = false;
var i;
for (i = 0; i < items.length; i++) {
  if (items[i].due && items[i].due <= today && !items[i].notified) {
    items[i].notified = true;
    dirty = true;
    display_notice("[ledger] #" + items[i].id + " due - " + items[i].text, "#ffd77f");
  }
}
if (dirty) { set_variable("ledger_items", JSON.stringify(items)); }
run_function("ledger_render", [], "ledger");
if (client.loom.ledger.pendingDigest) {
  client.loom.ledger.pendingDigest = false;
  run_function("ledger_digest", [], "ledger");
}
