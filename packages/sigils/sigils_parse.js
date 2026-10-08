// sigils_parse -- S.parseIn ("109 months", "about a month", ...) -> S.parseOut.
// -1 = unreadable, 0 = under a month.
var S = client.loom.sigils;
var txt = String(S.parseIn || "");
var months = -1;
if (/^about a month$/i.test(txt)) months = 1;
else if (/^about a year$/i.test(txt)) months = 12;
else {
  var m = /(\d+)\s*month/i.exec(txt);
  var y = /(\d+)\s*year/i.exec(txt);
  if (m) months = parseInt(m[1], 10);
  else if (y) months = parseInt(y[1], 10) * 12;
  else if (/less than/i.test(txt)) months = 0;
}
S.parseOut = months;
