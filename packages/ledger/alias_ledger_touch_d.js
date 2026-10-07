run_function("lg_build", [], "ledger");
var want = parseInt(args[1], 10);
var items = [];
try { items = JSON.parse(get_variable("lg_items")) || []; } catch (e) { items = []; }
var idx = -1;
var i;
for (i = 0; i < items.length; i++) { if (items[i].id === want) { idx = i; } }
if (idx < 0) {
  display_notice("[ledger] no item #" + want, "#ff5f5f");
} else {
  items[idx].touched = client.lg.day;
  set_variable("lg_items", JSON.stringify(items));
  display_notice("[ledger] #" + want + " touched", "#8fe0c8");
  run_function("lg_render", [], "ledger");
}
