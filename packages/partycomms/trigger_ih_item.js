// An IH line while partycomms is looking up your target: hidden, and the
// target's name kept when the number matches.
var PC = client.loom && client.loom.partycomms;
if (PC && PC.ih.on && (Date.now() / 1000) - PC.ih.at < 3) {
  gag_current_line();
  if (PC.ih.id && PC.ih.id === args[2]) PC.tName = { id: args[2], name: args[3] };
}
