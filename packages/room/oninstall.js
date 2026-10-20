run_function("room_setup", [], "room");
run_function("room_render", [], "room");
display_notice("[room] installed. Create a custom tab named Here; it fills in as you move. ROOM HELP for commands.", "lime");
// The two-line scripts' work (#136): made afresh, so a reimport replaces it.
run_function("room_gmcp", [], "room");
