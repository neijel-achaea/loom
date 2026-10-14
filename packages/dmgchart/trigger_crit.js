if (!client.loom || !client.loom.dmgchart || !client.loom.dmgchart.saved) run_function("dmgchart_setup", [], "dmgchart");
// "You have scored a CRUSHING CRITICAL hit!" comes right before the Damage
// dealt line it belongs to; dmgchart_add counts that hit as a crit (#185).
// Anchored on "You have scored", so other people's crits never match.
var crTier = String(args[1] || "").trim();
client.loom.dmgchart.crit = { tier: crTier.length ? crTier : "CRITICAL", t: Date.now() };
