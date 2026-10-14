if (!client.loom || !client.loom.talpieces || !client.loom.talpieces.pieces) run_function("talpieces_setup", [], "talpieces");
var TP = client.loom.talpieces;
var t = TP;
display_notice("[talpieces] still needed (of 64 common / 4 rare per colour):", "cyan");
var gc = 0, gr = 0;
for (var ci = 0; ci < t.colors.length; ci++) {
  var color = t.colors[ci], parts = [], need = 0;
  for (var ti = 0; ti < t.commonTypes.length; ti++) {
    var ty = t.commonTypes[ti];
    var n = Math.max(0, t.reqCommon - t.getcount(color, ty));
    need += n;
    parts.push(ty.substr(0, 2) + ":" + n);
  }
  var rare = t.colorrare[color];
  var rn = Math.max(0, t.reqRare - t.getcount(color, rare));
  gc += need; gr += rn;
  var line = color + "  " + parts.join(" ") + "  " + rare.substr(0, 4) + ":" + rn + "   = " + need + (rn > 0 ? (" +" + rn + "r") : "");
  display_notice("[talpieces] " + line, (need === 0 && rn === 0) ? "lime" : "cyan");
}
display_notice("[talpieces] TOTAL: " + gc + " common + " + gr + " rare still needed", "cyan");