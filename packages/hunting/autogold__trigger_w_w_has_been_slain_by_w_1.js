if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
var HU = client.loom.hunting;
// Only your own kills arm autogold: someone else's kill in the room is theirs.
// It also disarms one of yours still within the window, and for a moment stops
// the experience line arming it (a party shares the experience of a kill).
var huMe = String(HU.name || get_variable("hunting_name") || "").toLowerCase();
var huBy = String(args[2]).toLowerCase();
if (huMe !== "" && huBy === huMe) HU.kill = new Date().getTime();
else if (huMe !== "") { HU.kill = 0; HU.otherKill = new Date().getTime(); }
