if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
var HU = client.loom.hunting;
// Only your own kills arm autogold: someone else's kill in the room is theirs.
var huMe = String(HU.name || get_variable("hunting_name") || "").toLowerCase();
if (huMe !== "" && String(args[2]).toLowerCase() === huMe) HU.kill = new Date().getTime();
