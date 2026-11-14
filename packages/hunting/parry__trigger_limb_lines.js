// Auto-parry's lines (#484): limb damage, the parry confirmed or landing, a
// limb restored (HU.parryLine).
if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
client.loom.hunting.parryLine(String(args[0] || ""));
