var q = get_variable("mono_queue") || [];
if (q.length > 0) {
  run_function("mono_settle", [], "eleusis");
  run_function("mono_take", [], "eleusis");
  var head = get_variable("mono_head");
  if (head) {
    set_variable("mono_f_id", head.id);
    set_variable("mono_f_name", head.name);
    set_variable("mono_f_months", -1);
    set_variable("mono_f_flame", -1);
    run_function("mono_flag", [], "eleusis");
  }
}
