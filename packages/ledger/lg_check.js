// Fire notices for anything now due, then refresh the tab.
run_function("lg_build", [], "ledger");
var items = [];
try { items = JSON.parse(get_variable("lg_items")) || []; } catch (e) { items = []; }
var today = client.lg.day;
var dirty = false;
var i;
for (i = 0; i < items.length; i++) {
  if (items[i].due && items[i].due <= today && !items[i].notified) {
    items[i].notified = true;
    dirty = true;
    display_notice("[ledger] #" + items[i].id + " due - " + items[i].text, "#ffd77f");
  }
}
if (dirty) { set_variable("lg_items", JSON.stringify(items)); }
run_function("lg_render", [], "ledger");
if (client.lg.pendingDigest) {
  client.lg.pendingDigest = false;
  run_function("lg_digest", [], "ledger");
}
