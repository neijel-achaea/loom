run_function("lg_build", [], "ledger");
var want = parseInt(args[1], 10);
var items = [];
try { items = JSON.parse(get_variable("lg_items")) || []; } catch (e) { items = []; }
var today = client.lg.day;
var idx = -1;
var i;
for (i = 0; i < items.length; i++) { if (items[i].id === want) { idx = i; } }

if (idx < 0) {
  display_notice("[ledger] no item #" + want, "#ff5f5f");
} else if (items[idx].repeat) {
  var r = items[idx].repeat;
  var next;
  if (r.t == "i") {
    next = today + r.n;
  } else {
    var y = Math.floor((today - 1) / 300);
    next = y * 300 + r.m * 25 + r.d;
    while (next <= today) { next = next + 300; }
  }
  items[idx].due = next;
  items[idx].touched = today;
  items[idx].notified = false;
  set_variable("lg_items", JSON.stringify(items));
  var gap = next - today;
  display_notice("[ledger] #" + want + " done - next in " + Math.floor(gap / 25) + "mo " + (gap % 25) + "d", "#8fe0c8");
  run_function("lg_render", [], "ledger");
} else {
  var gone = items[idx].text;
  items.splice(idx, 1);
  set_variable("lg_items", JSON.stringify(items));
  display_notice("[ledger] #" + want + " done - " + gone, "#8fe0c8");
  run_function("lg_render", [], "ledger");
}
