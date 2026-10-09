// "You are not the member of any party." -- usually the answer to our own
// broadcast, so broadcasting stops until PARTYCOMMS ON.
if (!client.loom || !client.loom.partycomms || !client.loom.partycomms.members) run_function("partycomms_setup", [], "partycomms");
var PC = client.loom.partycomms;
if (PC.on) {
  PC.on = false;
  set_variable("partycomms_on", "0");
  display_notice("[partycomms] not in a party, so broadcasting is off. PARTYCOMMS ON once you join one.", "orange");
}
