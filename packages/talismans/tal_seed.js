run_function("tal_ensure", [], "talismans");
var s = client.talSeed;
if (!s) {
  display_notice("[talismans] nothing to seed.", "yellow");
} else {
  var d = new Date(s.y, s.m - 1, s.d, 12, 0, 0);
  var ts = Math.floor(d.getTime() / 1000);
  var hs = client.talHist;
  var out = [];
  var i;
  // Drop any existing point within twelve hours of the seed, then insert in order.
  for (i = 0; i < hs.length; i++) {
    if (Math.abs(hs[i][0] - ts) > 43200) { out.push(hs[i]); }
  }
  out.push([ts, s.c, s.r]);
  out.sort(function (a, b) { return a[0] - b[0]; });
  client.talHist = out;
  try { set_variable("tal_hist", JSON.stringify(out)); } catch (e) {}
  client.talSeed = null;
  display_notice("[talismans] seeded " + (s.c + s.r) + " pieces at " + s.d + "/" + s.m + "/" + s.y + ". History now holds " + out.length + " point" + (out.length === 1 ? "" : "s") + ".", "cyan");
  run_function("tal_render", [], "talismans");
}