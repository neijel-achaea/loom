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
  display_notice("[ledger] unknown month in date line: " + args[2], "#ff5f5f");
} else {
  if (client.loom.ledger.armed) {
    gag_current_line();
    client.loom.ledger.armed = false;
    client.loom.ledger.inBlock = true;
  }
  client.loom.ledger.day = yy * 300 + mi * 25 + dd;
  set_variable("ledger_day", "" + client.loom.ledger.day);
  run_function("ledger_check", [], "ledger");
}
