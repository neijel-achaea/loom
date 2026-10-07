run_function("tal_ensure", [], "talismans");
var hs = client.talHist || [];
var goal = client.talGoalTotal;
var MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fl(sec) {
  var d = new Date(sec * 1000);
  return d.getDate() + " " + MN[d.getMonth()] + " " + d.getFullYear();
}
function rateOver(days) {
  if (hs.length < 2) { return null; }
  var last = hs[hs.length - 1];
  var cutoff = last[0] - days * 86400;
  var ref = hs[0];
  for (var i = hs.length - 1; i >= 0; i--) { if (hs[i][0] <= cutoff) { ref = hs[i]; break; } }
  var span = (last[0] - ref[0]) / 86400;
  if (span <= 0) { return null; }
  return { gain: (last[1] + last[2]) - (ref[1] + ref[2]), days: span, per: ((last[1] + last[2]) - (ref[1] + ref[2])) / span, whole: (ref[0] === hs[0][0]) };
}
if (hs.length === 0) {
  display_notice("[talismans] no history recorded yet. Find or list a piece, or use TALMARK to store the first point.", "cyan");
} else {
  var last2 = hs[hs.length - 1];
  var tot = last2[1] + last2[2];
  var pct = Math.round((tot / goal) * 1000) / 10;
  display_notice("[talismans] progress: " + tot + " / " + goal + " pieces (" + pct + "%), " + (goal - tot) + " to go", "cyan");
  display_notice("[talismans] tracking since " + fl(hs[0][0]) + " across " + hs.length + " data point" + (hs.length === 1 ? "" : "s") + ", latest " + fl(last2[0]), "white");
  var windows = [7, 30];
  for (var w = 0; w < windows.length; w++) {
    var r = rateOver(windows[w]);
    // Skip a window that reaches all the way back: the all-time line says it.
    if (r && !r.whole) {
      display_notice("[talismans] last " + windows[w] + "d: +" + r.gain + " pieces = " + (Math.round(r.per * 10) / 10) + "/day", "white");
    }
  }
  var all = rateOver(100000);
  if (all) {
    display_notice("[talismans] all time: +" + all.gain + " pieces over " + (Math.round(all.days * 10) / 10) + "d = " + (Math.round(all.per * 10) / 10) + "/day", "white");
  }
  var seven = rateOver(7);
  if (tot >= goal) {
    display_notice("[talismans] the set is complete.", "green");
  } else if (seven && seven.per > 0) {
    var dl = (goal - tot) / seven.per;
    display_notice("[talismans] at the " + (seven.whole ? "all-time" : "7-day") + " rate: about " + Math.ceil(dl) + " days left, finishing near " + fl(last2[0] + Math.round(dl * 86400)), "cyan");
  } else if (all && all.per > 0) {
    var dl2 = (goal - tot) / all.per;
    display_notice("[talismans] no gain in the last 7 days. At the all-time rate: about " + Math.ceil(dl2) + " days left.", "yellow");
  } else {
    display_notice("[talismans] not enough movement yet to project a finish.", "yellow");
  }
}