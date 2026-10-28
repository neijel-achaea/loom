run_function("partycomms_icon", [], "partycomms");
// Members start from nothing at every load (#421): only those heard from
// after it show, in the tab and in Here's party targets.
if (client.loom && client.loom.partycomms) client.loom.partycomms.members = {};
run_function("partycomms_setup", [], "partycomms");
run_function("partycomms_render", [], "partycomms");
// The two-line scripts' work (#136): made afresh, so a reimport replaces it.
run_function("partycomms_gmcp", [], "partycomms");
if (client.loom && client.loom.notify) client.loom.notify("partycomms");
