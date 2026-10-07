run_function("mono_settle", [], "eleusis");

var bad = get_variable("mono_bad") || {};
var ign = get_variable("mono_ignore") || {};
var thr = get_variable("mono_threshold");
if (thr === null || thr === undefined) thr = 10;
var cm = get_variable("mono_cost_monolith");
if (cm === null || cm === undefined) cm = 1500;
var cf = get_variable("mono_cost_flame");
if (cf === null || cf === undefined) cf = 500;

var monoRows = [];
var flameRows = [];
var keys = Object.keys(bad);
var i = 0;
for (i = 0; i < keys.length; i++) {
  var r = bad[keys[i]];
  if (ign[r.id]) continue;
  var fl = (r.flame === undefined || r.flame === null || r.months < 0) ? -1 : r.flame;
  var idcol = ("      " + r.id).slice(-6);

  if (r.months < thr) {
    var ms = "none";
    if (r.months === 0) ms = "<1";
    if (r.months > 0) ms = String(r.months);
    monoRows.push(("00000" + (r.months < 0 ? 0 : r.months + 1)).slice(-5)
      + "  " + ("      " + ms).slice(-6) + "  " + idcol + "  " + r.name);
  }
  if (fl < thr) {
    var fs = "none";
    if (fl === 0) fs = "<1";
    if (fl > 0) fs = String(fl);
    flameRows.push(("00000" + (fl < 0 ? 0 : fl + 1)).slice(-5)
      + "  " + ("      " + fs).slice(-6) + "  " + idcol + "  " + r.name);
  }
}
monoRows.sort();
flameRows.sort();

var colhead = "  Months    Room  Location";

display_notice("ELEUSIS SIGIL REPORT", "yellow");
display_notice("Rooms with less than " + thr + " months of usefulness left.", "white");
display_notice(" ", "white");

display_notice("EXPIRING MONOLITH SIGILS (" + monoRows.length + ")", "yellow");
if (monoRows.length === 0) display_notice("  None.", "white");
else {
  display_notice(colhead, "white");
  for (i = 0; i < monoRows.length; i++) display_notice(monoRows[i].slice(5), "white");
}
display_notice(" ", "white");

display_notice("EXPIRING FLAME SIGILS (" + flameRows.length + ")", "yellow");
if (flameRows.length === 0) display_notice("  None.", "white");
else {
  display_notice(colhead, "white");
  for (i = 0; i < flameRows.length; i++) display_notice(flameRows[i].slice(5), "white");
}
display_notice(" ", "white");

var tm = monoRows.length * cm;
var tf = flameRows.length * cf;
var money = [String(cm), String(cf), String(tm), String(tf), String(tm + tf)];
for (i = 0; i < money.length; i++) money[i] = money[i].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

display_notice("ESTIMATED COST (NEXT 6 MONTHS)", "yellow");
display_notice("  Monolith sigils " + ("   " + monoRows.length).slice(-3) + " x " + ("     " + money[0]).slice(-5)
  + " = " + ("       " + money[2]).slice(-7) + " gold", "white");
display_notice("  Flame sigils    " + ("   " + flameRows.length).slice(-3) + " x " + ("     " + money[1]).slice(-5)
  + " = " + ("       " + money[3]).slice(-7) + " gold", "white");
display_notice("  Total                         " + ("       " + money[4]).slice(-7) + " gold", "white");

display_notice("[eleusis] MONOCLEAR to wipe the list.", "cyan");
