// Class toggles (Sneak, Weave, Block) start OFF on every load: the game
// doesn't keep shroud or hide across a login, so a remembered ON would
// show a defence you don't have.
set_variable("hunting_toggles", "{}");
if (client.loom && client.loom.hunting) client.loom.hunting.toggles = {};
run_function("hunting_setup", [], "hunting");
run_function("hunting_buttons", [], "hunting");
// The two-line scripts' work (#136): made afresh, so a reimport replaces it.
run_function("hunting_gmcp", [], "hunting");
run_function("hunting_line", [], "hunting");
