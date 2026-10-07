// Handles BOTH the hourly rollover and the DATE reply - same tail, one pattern.
run_function("lg_build", [], "ledger");
var dd = parseInt(args[1], 10);
var mn = args[2].toLowerCase();
var yy = parseInt(args[3], 10);
var mi = -1;
var i;
for (i = 0; i < client.lg.months.length; i++) {
  if (client.lg.months[i].toLowerCase() == mn) { mi = i; }
}
if (mi < 0) {
  display_notice("[ledger] unknown month in date line: " + args[2], "#ff5f5f");
} else {
  if (client.lg.armed) {
    gag_current_line();
    client.lg.armed = false;
    client.lg.inBlock = true;
  }
  client.lg.day = yy * 300 + mi * 25 + dd;
  set_variable("lg_day", "" + client.lg.day);
  run_function("lg_check", [], "ledger");
}
