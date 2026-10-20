run_function("hunting_setup", [], "hunting");
run_function("hunting_buttons", [], "hunting");
display_notice("[hunting] installed. HUNTING HELP for commands.", "lime");
// Nexus shows 7 buttons by default and a script can't change that (#114).
display_notice("[hunting] To see all 12 F-keys: gear icon (bottom right) > Buttons > Button Count slider to 12.", "cyan");
// The two-line scripts' work (#136): made afresh, so a reimport replaces it.
run_function("hunting_gmcp", [], "hunting");
run_function("hunting_line", [], "hunting");
