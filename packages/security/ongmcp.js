// Selfishness is followed from the defence list as well as from its messages.
if (!client.loom || !client.loom.security || !client.loom.security.items) run_function("security_setup", [], "security");
var SE = client.loom.security;
var seM = args.gmcp_method;
var seA = args.gmcp_args;
// A list or name that came empty, or in another shape, changes nothing (#135).
if (seA === null || seA === undefined || typeof seA != "object") seA = {};
if (seM == "Char.Defences.List") {
  SE.selfish = false;
  for (var seI = 0; seI < seA.length; seI++) { if (seA[seI].name == "selfishness") SE.selfish = true; }
} else if (seM == "Char.Defences.Add" && seA.name == "selfishness") {
  SE.selfish = true;
} else if (seM == "Char.Defences.Remove") {
  for (var seJ = 0; seJ < seA.length; seJ++) { if (seA[seJ] == "selfishness") SE.selfish = false; }
}
