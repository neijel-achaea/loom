run_function("huntstats_setup", [], "huntstats");
run_function("huntstats_render", [], "huntstats");
display_notice("[huntstats] installed. Create a UI tab named 'Stats' for the panel. HUNTSTATS HELP for commands.", "lime");
// The two-line scripts' work (#136): made afresh, so a reimport replaces it.
run_function("huntstats_gmcp", [], "huntstats");
