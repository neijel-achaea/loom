// An IH line while partycomms is looking up your target: hidden, and the
// target's name kept when the number matches.
var PC = client.loom && client.loom.partycomms;
if (PC && PC.ih.on && (Date.now() / 1000) - PC.ih.at < 3) {
  gag_current_line();
  var pcTar = String(get_variable("tar") || "");
  if (pcTar === args[1] + args[2] || pcTar === args[2] || (pcTar.match(/\d+/) || [""])[0] === args[2]) {
    PC.tName = { id: args[2], name: args[3] };
  }
}
