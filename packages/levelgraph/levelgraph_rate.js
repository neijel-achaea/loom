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

  // The session (#335): from its start, whatever the graph's span.
  var sF = LG.sessFigures ? LG.sessFigures(cur) : null;
  if (sF && sF.span >= 60) {
    display_notice("[levelgraph] session (since " + fl(sF.s) + ", " + Math.round(sF.span / 60) + " min): " + (sF.gain >= 0 ? "+" : "") +
      (Math.round(sF.gain * 10000) / 100) + "% = " + (Math.round(sF.perHour * 10000) / 100) + "%/hr", "cyan");
    if (sF.perHour > 0) {
      var togo = sF.togo / 3600;
      var hh = Math.floor(togo);
      var mm = Math.round((togo - hh) * 60);
      display_notice("[levelgraph] at that rate, level " + (cur[1] + 1) + " in about " + (hh > 0 ? hh + "h " : "") + mm + "m", "cyan");
    }
  } else {
    display_notice("[levelgraph] the session has just started; a rate after a minute.", "orange");
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
  display_notice("[levelgraph] graphs: last " + LG.mins + " min, last " + LG.days + " days; a session closes after " + LG.gap + " silent minutes. LEVELGRAPH HELP for commands.", "cyan");
}