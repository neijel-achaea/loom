var D = client.loom.defcon;
run_function("defcon_table", [], "defcon");
display_notice("[defcon] DEFCON " + ((D.level === null || D.level === undefined) ? "5 (default, not applied yet in this class)" : D.level)
  + ", class " + D.tbl.name + (D.tbl.known ? "" : " (not configured yet: general defences)")
  + ", init at login " + String(get_variable("defcon_autoinit")).toUpperCase() + ". DEFCON HELP for commands.", "cyan");
// Skill defences left out (#173).
var dcOffL = [];
for (var dcSi = 0; dcSi < D.tbl.defs.length; dcSi++) { if (D.isOff && D.isOff(D.tbl.defs[dcSi][0])) dcOffL.push(D.tbl.defs[dcSi][0]); }
// A check that ended without asking anything (no answers in time) proves
// nothing: said as such, not as "all learned".
var dcSl = D.skillLast;
var dcSkOk = dcSl && (dcSl.asked > 0 || dcSl.how === "no skills");
display_notice("[defcon] " + (dcOffL.length ? "not learned yet, left out of curing: " + dcOffL.join(", ") + "."
  : (!dcSl ? "skills not checked yet: DEFCON INIT checks them."
  : (dcSkOk ? "every skill defence in the table is learned."
  : "the skill check got no answers from the game (" + dcSl.how + "): DEFCON INIT tries again."))), "cyan");
