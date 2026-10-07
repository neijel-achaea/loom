if (get_variable("mono_threshold") === null || get_variable("mono_threshold") === undefined) {
  set_variable("mono_threshold", 10);
}
if (!get_variable("mono_bad")) set_variable("mono_bad", {});
if (!get_variable("mono_ignore")) set_variable("mono_ignore", { "6742": "?" });
set_variable("mono_queue", []);
set_variable("mono_await", null);
display_notice("[eleusis] 0.4 ready. Threshold " + get_variable("mono_threshold") + " months. MONOWATCH ON to start.", "cyan");
