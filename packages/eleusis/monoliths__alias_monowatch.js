var mode = args[1] ? String(args[1]).toLowerCase() : "";
var next = get_variable("mono_on") ? false : true;
if (mode === "on") next = true;
if (mode === "off") next = false;

var thr = get_variable("mono_threshold");
if (thr === null || thr === undefined) { thr = 10; set_variable("mono_threshold", 10); }
if (!get_variable("mono_bad")) set_variable("mono_bad", {});
if (!get_variable("mono_ignore")) set_variable("mono_ignore", { "6742": "?" });

run_function("mono_settle", [], "eleusis");
set_variable("mono_on", next);
set_variable("mono_queue", []);
set_variable("mono_await", null);
if (next) {
  display_notice("[eleusis] Watch ON. Probing every room, flagging under " + thr + " months (monolith and flame).", "lime");
} else {
  var n = Object.keys(get_variable("mono_bad") || {}).length;
  display_notice("[eleusis] Watch OFF. " + n + " room(s) flagged. MONOREPORT to see them.", "yellow");
}
