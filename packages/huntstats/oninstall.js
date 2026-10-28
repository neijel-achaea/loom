// The party starts empty at every load (#421, Ricardo): HUNTSTATS PARTY ADD
// again for a new session's party.
try { delete_variable("huntstats_party"); } catch (e) {}
if (client.loom && client.loom.huntstats) client.loom.huntstats.party = [];
run_function("huntstats_setup", [], "huntstats");
run_function("huntstats_render", [], "huntstats");
display_notice("[huntstats] installed. Create a UI tab named 'Stats' for the panel. HUNTSTATS HELP for commands.", "lime");
// The two-line scripts' work (#136): made afresh, so a reimport replaces it.
run_function("huntstats_gmcp", [], "huntstats");
