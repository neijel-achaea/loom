run_function("comms_setup", [], "comms");
run_function("comms_render", [], "comms");
display_notice("[comms] installed. Create a custom tab named Comms; channel lines fill it as they come. COMMS HELP for commands.", "lime");
// The two-line scripts' work (#136): made afresh, so a reimport replaces it.
run_function("comms_gmcp", [], "comms");
