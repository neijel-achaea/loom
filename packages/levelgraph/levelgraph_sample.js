if (!client.loom || !client.loom.levelgraph || !client.loom.levelgraph.day) run_function("levelgraph_setup", [], "levelgraph");
var LG = client.loom.levelgraph;
// Level and percent to next level, as the onGMCP handler last read them.
var lv = parseFloat(LG.level);
var nl = parseFloat(LG.nl);
if (isNaN(lv)) { lv = 0; }
if (isNaN(nl)) { nl = 0; }
if (nl < 0) { nl = 0; }
if (nl > 100) { nl = 100; }

if (lv > 0) {
  var now = Math.floor(new Date().getTime() / 1000);
  var nlr = Math.round(nl * 100) / 100;
  var force = LG.forceMark ? true : false;
  LG.forceMark = false;
  var wrote = false;

  // Absolute buckets rather than elapsed time. Sliding a point's timestamp
  // within its own bucket cannot move it to another bucket, so no separate
  // anchor is needed to decide when a new point begins.
  function minKey(t) { return Math.floor(t / 60); }
  function dayKey(t) {
    var d = new Date(t * 1000);
    return d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
  }

  function dayStart(t) {
    var d = new Date(t * 1000);
    d.setHours(0, 0, 0, 0);
    return Math.floor(d.getTime() / 1000);
  }

  // Session buffer ticks once a minute whether or not experience moved, so
  // the pane reads as a clock over the trailing window. Idle time is a flat
  // segment rather than a gap.
  function feedMin() {
    var arr = LG.min;
    if (arr.length === 0) { arr.push([now, lv, nlr]); return true; }
    var last = arr[arr.length - 1];
    if (minKey(last[0]) !== minKey(now)) { arr.push([now, lv, nlr]); return true; }
    if (last[1] !== lv || last[2] !== nlr) {
      last[0] = now; last[1] = lv; last[2] = nlr;
      return true;
    }
    return false;
  }

  // Day buffer carries the last known value across days that were never
  // played, so a week away shows as a week of flat line rather than a jump.
  function feedDay() {
    var arr = LG.day;
    if (arr.length === 0) { arr.push([now, lv, nlr]); return true; }
    var last = arr[arr.length - 1];
    if (dayKey(last[0]) === dayKey(now)) {
      if (last[1] !== lv || last[2] !== nlr) {
        last[0] = now; last[1] = lv; last[2] = nlr;
        return true;
      }
      return false;
    }
    var carryLv = last[1];
    var carryNl = last[2];
    var cut = now - LG.days * 86400;
    var todayStart = dayStart(now);
    // Step by calendar date rather than by 86400 so daylight saving does not
    // drift the cursor off midnight.
    var cur = new Date(dayStart(last[0]) * 1000);
    cur.setDate(cur.getDate() + 1);
    var guard = 0;
    while (Math.floor(cur.getTime() / 1000) < todayStart && guard < 400) {
      var noon = Math.floor(cur.getTime() / 1000) + 43200;
      if (noon >= cut) { arr.push([noon, carryLv, carryNl]); }
      cur.setDate(cur.getDate() + 1);
      guard++;
    }
    arr.push([now, lv, nlr]);
    return true;
  }

  // The session: a silence longer than the gap closes it; the next sample
  // opens a new one (#335).
  var prg = lv + nlr / 100;
  if (LG.sess && now - LG.sess.last > LG.gap * 60) { LG.sess = null; }
  if (!LG.sess) { LG.sess = { s: now, last: now, p0: prg }; LG.saveSess(); }
  else {
    LG.sess.last = now;
    if (now - (LG.sessSaved || 0) >= 60) { LG.saveSess(); }
  }

  if (feedMin()) { wrote = true; }
  if (feedDay()) { wrote = true; }

  // Trailing windows: anything older than the span simply falls off the front.
  var minCut = now - LG.mins * 60;
  while (LG.min.length > 0 && LG.min[0][0] < minCut) { LG.min.shift(); }
  var dayCut = now - LG.days * 86400;
  while (LG.day.length > 0 && LG.day[0][0] < dayCut) { LG.day.shift(); }

  var lastWrite = LG.lastWrite || 0;
  if (wrote && (force || (now - lastWrite) >= 5)) {
    LG.lastWrite = now;
    try { set_variable("levelgraph_min", JSON.stringify(LG.min)); } catch (e) {}
    try { set_variable("levelgraph_day", JSON.stringify(LG.day)); } catch (e) {}
    run_function("levelgraph_render", [], "levelgraph");
  }
}