var aw = get_variable("mono_await");
if (aw) {
  set_variable("mono_p_txt", args[1]);
  run_function("mono_parse", [], "eleusis");
  aw.flame = get_variable("mono_p_months");
  set_variable("mono_await", aw);
  run_function("mono_settle", [], "eleusis");
}
