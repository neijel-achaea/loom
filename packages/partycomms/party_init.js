// partycomms 0.3 - reset all state. Safe to run any time.
set_variable("party_data", {});
set_variable("party_last_send", 0);
set_variable("party_last_sent", {});
set_variable("party_last_render", 0);
if (!get_variable("party_me")) {
  display_notice("[partycomms] No name set. Run: partyname YourName", "orange");
} else {
  display_notice("[partycomms] 0.3 ready as " + get_variable("party_me"), "cyan");
}
run_function("party_render", [], "partycomms");