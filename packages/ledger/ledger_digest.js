// ledger_digest -- on-demand / login summary printed to the main window.
if (!client.loom || !client.loom.ledger || !client.loom.ledger.months) run_function("ledger_setup", [], "ledger");
var items = [];
try { items = JSON.parse(get_variable("ledger_items")) || []; } catch (e) { items = []; }
var today = client.loom.ledger.day;

var n = today - 1;
var yy = Math.floor(n / 300);
var rem = n - yy * 300;
var mi = Math.floor(rem / 25);
var dd = (rem % 25) + 1;
var stamp = today > 0 ? (client.loom.ledger.ord(dd) + " " + client.loom.ledger.months[mi] + " " + yy) : "date unknown";
display_notice("[ledger] " + stamp, "cyan");

var dated = [];
var standing = [];
var i;
for (i = 0; i < items.length; i++) {
  if (items[i].due) { dated.push(items[i]); } else { standing.push(items[i]); }
}

var j, cur;
for (i = 1; i < dated.length; i++) {
  cur = dated[i]; j = i - 1;
  while (j >= 0 && dated[j].due > cur.due) { dated[j + 1] = dated[j]; j--; }
  dated[j + 1] = cur;
}
for (i = 1; i < standing.length; i++) {
  cur = standing[i]; j = i - 1;
  while (j >= 0 && standing[j].touched > cur.touched) { standing[j + 1] = standing[j]; j--; }
  standing[j + 1] = cur;
}

var shown = 0;
for (i = 0; i < dated.length; i++) {
  var diff = dated[i].due - today;
  var mag = diff < 0 ? -diff : diff;
  var mm = Math.floor(mag / 25);
  var ddiff = mag % 25;
  var rel = "";
  if (mm > 0) { rel = mm + (mm == 1 ? " month" : " months"); }
  if (ddiff > 0) { rel = rel + (rel.length ? ", " : "") + ddiff + (ddiff == 1 ? " day" : " days"); }
  if (!rel.length) { rel = "today"; }
  if (diff < 0) {
    display_notice("[ledger] #" + dated[i].id + " OVERDUE by " + rel + " - " + dated[i].text + (dated[i].source && dated[i].source !== "manual" ? " (" + dated[i].source + ")" : ""), "orange");
    shown++;
  } else if (shown < 5) {
    var lead = (diff === 0) ? "today" : ("in " + rel);
    display_notice("[ledger] #" + dated[i].id + " " + lead + " - " + dated[i].text + (dated[i].source && dated[i].source !== "manual" ? " (" + dated[i].source + ")" : ""), "cyan");
    shown++;
  }
}
if (dated.length === 0) { display_notice("[ledger] nothing on the calendar", "cyan"); }

if (standing.length > 0) {
  display_notice("[ledger] " + standing.length + " standing - oldest: #" + standing[0].id + " " + standing[0].text, "cyan");
}
