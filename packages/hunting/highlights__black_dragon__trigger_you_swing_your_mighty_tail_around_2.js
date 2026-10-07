var cd = get_variable("rage_cd") || {};
cd["Dragonsting"] = false;

set_variable("rage_cd", cd);
set_variable("rage_global", false);
run_function("hl_buttons", [], "hunting");