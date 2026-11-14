// The lines around autogold's pickup: your kill's experience, the pickup
// done or refused, stun or paralysis over, a ripple's end (HU.goldLine).
if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
client.loom.hunting.goldLine(String(args[0] || ""));
