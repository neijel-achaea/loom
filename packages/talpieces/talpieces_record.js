if (!client.loom || !client.loom.talpieces || !client.loom.talpieces.pieces) run_function("talpieces_setup", [], "talpieces");
var TP = client.loom.talpieces;
var tpTot = TP.totals();
var cOwn = tpTot[0];
var rOwn = tpTot[1];
TP.nowC = cOwn;
TP.nowR = rOwn;

var hs = TP.hist;
var now = Math.floor(new Date().getTime() / 1000);
var force = TP.forceMark ? true : false;
TP.forceMark = false;

if (hs.length === 0) {
  hs.push([now, cOwn, rOwn]);
} else {
  var last = hs[hs.length - 1];
  if (!force && (now - last[0]) < TP.bucket) {
    // Same hourly bucket: overwrite in place. This is what stops a full list
    // rebuild, which syncs once per row, from drawing a fake ramp from zero.
    last[1] = cOwn;
    last[2] = rOwn;
  } else if (force || last[1] !== cOwn || last[2] !== rOwn) {
    hs.push([now, cOwn, rOwn]);
  }
}

// Compaction keeps the persisted variable small: full detail for the last
// thirty days, one point per day before that.
if (hs.length > TP.histSoft) {
  var keep = [];
  var oldCut = now - 30 * 86400;
  var lastDay = "";
  var idx;
  for (idx = 0; idx < hs.length; idx++) {
    if (hs[idx][0] >= oldCut) {
      keep.push(hs[idx]);
    } else {
      var dd = new Date(hs[idx][0] * 1000);
      var key = dd.getFullYear() + "/" + dd.getMonth() + "/" + dd.getDate();
      if (key === lastDay && keep.length > 0) { keep[keep.length - 1] = hs[idx]; }
      else { keep.push(hs[idx]); lastDay = key; }
    }
  }
  hs = keep;
  TP.hist = hs;
}
if (hs.length > TP.histCap) { hs.splice(0, hs.length - TP.histCap); }

// Skip the write while a list rebuild is in flight; the flush at the end of
// the build, or the next real event, persists it.
if (!TP.building) {
  try { set_variable("talpieces_hist", JSON.stringify(hs)); } catch (e) {}
}