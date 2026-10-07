var cd = get_variable("rage_cd") || {};
cd[args[1]] = true;
set_variable("rage_cd", cd);
run_function("hl_buttons", [], "battlerage");