run_function("tal_ensure", [], "talismans");
var t = client.tal;
var cOwn = 0;
var rOwn = 0;
for (var ci = 0; ci < t.colors.length; ci++) {
  var color = t.colors[ci];
  for (var ti = 0; ti < t.commonTypes.length; ti++) {
    var n = t.getcount(color, t.commonTypes[ti]);
    cOwn += (n > t.reqCommon) ? t.reqCommon : n;
  }
  var rn = t.getcount(color, t.colorrare[color]);
  rOwn += (rn > t.reqRare) ? t.reqRare : rn;
}
client.talNowC = cOwn;
client.talNowR = rOwn;

var hs = client.talHist;
var now = Math.floor(new Date().getTime() / 1000);
var force = client.talForceMark ? true : false;
client.talForceMark = false;

if (hs.length === 0) {
  hs.push([now, cOwn, rOwn]);
} else {
  var last = hs[hs.length - 1];
  if (!force && (now - last[0]) < client.talBucket) {
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
if (hs.length > client.talHistSoft) {
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
  client.talHist = hs;
}
if (hs.length > client.talHistCap) { hs.splice(0, hs.length - client.talHistCap); }

// Skip the write while a list rebuild is in flight; the flush at the end of
// the build, or the next real event, persists it.
if (!client.talBuilding) {
  try { set_variable("tal_hist", JSON.stringify(hs)); } catch (e) {}
}