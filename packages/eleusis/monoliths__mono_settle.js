// mono_settle -- finalises the monolith waiting in mono_await.
// flame undefined at this point means the flame line never showed: missing.
var aw = get_variable("mono_await");
if (aw) {
  set_variable("mono_await", null);
  var fl = (aw.flame === undefined || aw.flame === null) ? -1 : aw.flame;
  set_variable("mono_f_id", aw.id);
  set_variable("mono_f_name", aw.name);
  set_variable("mono_f_months", aw.months);
  set_variable("mono_f_flame", fl);
  run_function("mono_flag", [], "eleusis");
}
