var q = get_variable("mono_queue") || [];
if (q.length > 0) {
  run_function("mono_settle", [], "eleusis");
  run_function("mono_take", [], "eleusis");
  var head = get_variable("mono_head");
  if (head) {
    set_variable("mono_p_txt", args[1]);
    run_function("mono_parse", [], "eleusis");
    head.months = get_variable("mono_p_months");
    // Wait for a possible flame line before deciding.
    set_variable("mono_await", head);
  }
}
