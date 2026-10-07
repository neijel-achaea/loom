set_variable("party_data", {});
set_variable("party_last_render", 0);
run_function("party_render", [], "partycomms");
display_notice("[partycomms] party data cleared", "orange");