if (!client.loom || !client.loom.talpieces || !client.loom.talpieces.pieces) run_function("talpieces_setup", [], "talpieces");
var TP = client.loom.talpieces;
var s = TP.seed;
if (!s) {
  display_notice("[talpieces] nothing to seed.", "orange");
} else {
  var d = new Date(s.y, s.m - 1, s.d, 12, 0, 0);
  var ts = Math.floor(d.getTime() / 1000);
  var hs = TP.hist;
  var out = [];
  var i;
  // Drop any existing point within twelve hours of the seed, then insert in order.
  for (i = 0; i < hs.length; i++) {
    if (Math.abs(hs[i][0] - ts) > 43200) { out.push(hs[i]); }
  }
  out.push([ts, s.c, s.r]);
  out.sort(function (a, b) { return a[0] - b[0]; });
  TP.hist = out;
  try { set_variable("talpieces_hist", JSON.stringify(out)); } catch (e) {}
  TP.seed = null;
  display_notice("[talpieces] seeded " + (s.c + s.r) + " pieces at " + s.d + "/" + s.m + "/" + s.y + ". History now holds " + out.length + " point" + (out.length === 1 ? "" : "s") + ".", "lime");
  run_function("talpieces_render", [], "talpieces");
}