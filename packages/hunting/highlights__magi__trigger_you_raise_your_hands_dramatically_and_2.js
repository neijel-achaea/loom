var cd = get_variable("rage_cd") || {};
cd["Firefall"] = false;

set_variable("rage_cd", cd);
set_variable("rage_global", false);
run_function("hl_buttons", [], "hunting");