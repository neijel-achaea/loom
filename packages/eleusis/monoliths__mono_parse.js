// mono_parse -- mono_p_txt ("109 months", "about a month", ...) -> mono_p_months.
// -1 = unreadable, 0 = under a month.
var txt = String(get_variable("mono_p_txt") || "");
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
set_variable("mono_p_months", months);
