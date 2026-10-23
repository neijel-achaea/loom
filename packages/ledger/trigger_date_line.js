// Handles BOTH the hourly rollover and the DATE reply - same tail, one pattern.
if (!client.loom || !client.loom.ledger || !client.loom.ledger.months) run_function("ledger_setup", [], "ledger");
var dd = parseInt(args[1], 10);
var mn = args[2].toLowerCase();
var yy = parseInt(args[3], 10);
var mi = -1;
var i;
for (i = 0; i < client.loom.ledger.months.length; i++) {
  if (client.loom.ledger.months[i].toLowerCase() == mn) { mi = i; }
}
if (mi < 0) {
  display_notice("[ledger] unknown month in date line: " + args[2], "orange");
} else {
  if (client.loom.ledger.armed) {
    gag_current_line();
    client.loom.ledger.armed = false;
    client.loom.ledger.inBlock = true;
  }
  client.loom.ledger.day = yy * 300 + mi * 25 + dd;
  set_variable("ledger_day", "" + client.loom.ledger.day);
  // Items added while the date was still unknown (another package's reminder
  // right after login) were stamped day 0: give them today, or a standing
  // item reads "untouched 12280mo" once the date comes.
  var ldItems = [];
  try { ldItems = JSON.parse(get_variable("ledger_items") || "[]"); } catch (e) { ldItems = []; }
  if (Array.isArray(ldItems)) {
    var ldFix = false;
    for (i = 0; i < ldItems.length; i++) {
      var ldIt = ldItems[i];
      if (!ldIt || typeof ldIt !== "object") continue;
      if (!ldIt.created) { ldIt.created = client.loom.ledger.day; ldFix = true; }
      if (!ldIt.touched) { ldIt.touched = client.loom.ledger.day; ldFix = true; }
    }
    if (ldFix) set_variable("ledger_items", JSON.stringify(ldItems));
  }
  run_function("ledger_check", [], "ledger");
}
