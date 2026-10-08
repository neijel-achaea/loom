if (!client.loom || !client.loom.levelgraph || !client.loom.levelgraph.day) run_function("levelgraph_setup", [], "levelgraph");
var LG = client.loom.levelgraph;
var mins = LG.min || [];
var days = LG.day || [];
var MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fl(sec) {
  var d = new Date(sec * 1000);
  var mi = d.getMinutes();
  return d.getDate() + " " + MN[d.getMonth()] + " " + d.getFullYear() + " " + d.getHours() + ":" + (mi < 10 ? "0" : "") + mi;
}
function prog(p) { return p[1] + p[2] / 100; }

var cur = null;
if (mins.length > 0) { cur = mins[mins.length - 1]; }
else if (days.length > 0) { cur = days[days.length - 1]; }

if (!cur) {
  display_notice("[levelgraph] no samples recorded yet. Use LEVELGRAPH MARK to store the first point.", "cyan");
} else {
  display_notice("[levelgraph] level " + cur[1] + ", " + cur[2].toFixed(2) + "% to next", "cyan");

  if (mins.length >= 2) {
    var sSpan = mins[mins.length - 1][0] - mins[0][0];
    var sGain = prog(mins[mins.length - 1]) - prog(mins[0]);
    if (sSpan > 0) {
      var perHour = sGain / (sSpan / 3600);
      display_notice("[levelgraph] session (" + Math.round(sSpan / 60) + " min, " + mins.length + " points): +" +
        (Math.round(sGain * 10000) / 100) + "% = " + (Math.round(perHour * 10000) / 100) + "%/hr", "cyan");
      if (perHour > 0) {
        var togo = (1 - (cur[2] / 100)) / perHour;
        var hh = Math.floor(togo);
        var mm = Math.round((togo - hh) * 60);
        display_notice("[levelgraph] at that rate, level " + (cur[1] + 1) + " in about " + (hh > 0 ? hh + "h " : "") + mm + "m", "cyan");
      }
    }
  } else {
    display_notice("[levelgraph] session buffer has " + mins.length + " point(s); needs two for a rate.", "orange");
  }

  if (days.length >= 2) {
    var lSpan = (days[days.length - 1][0] - days[0][0]) / 86400;
    var lGain = prog(days[days.length - 1]) - prog(days[0]);
    display_notice("[levelgraph] long term (" + days.length + " days stored, first " + fl(days[0][0]) + "): +" +
      (Math.round(lGain * 100) / 100) + " levels over " + (Math.round(lSpan * 10) / 10) + "d", "cyan");
    if (lSpan > 0) {
      display_notice("[levelgraph] average " + (Math.round((lGain / lSpan) * 100) / 100) + " levels/day", "cyan");
    }
  } else {
    display_notice("[levelgraph] long-term buffer has " + days.length + " day(s); needs two for a rate.", "orange");
  }
  display_notice("[levelgraph] windows: " + LG.mins + " min session, " + LG.days + " day long term. LEVELGRAPH HELP for commands.", "cyan");
}