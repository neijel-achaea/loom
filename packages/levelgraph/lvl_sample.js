run_function("lvl_ensure", [], "levelgraph");
var lv = 0;
var nl = 0;
try { lv = parseFloat(String(get_variable("my_level"))); } catch (e) { lv = 0; }
try { nl = parseFloat(String(get_variable("my_nl"))); } catch (e) { nl = 0; }
if (isNaN(lv)) { lv = 0; }
if (isNaN(nl)) { nl = 0; }
if (nl < 0) { nl = 0; }
if (nl > 100) { nl = 100; }

if (lv > 0) {
  var now = Math.floor(new Date().getTime() / 1000);
  var nlr = Math.round(nl * 100) / 100;
  var force = client.lvlForceMark ? true : false;
  client.lvlForceMark = false;
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
    var arr = client.lvlMin;
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
    var arr = client.lvlDay;
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
    var cut = now - client.lvlDays * 86400;
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

  if (feedMin()) { wrote = true; }
  if (feedDay()) { wrote = true; }

  // Trailing windows: anything older than the span simply falls off the front.
  var minCut = now - client.lvlMins * 60;
  while (client.lvlMin.length > 0 && client.lvlMin[0][0] < minCut) { client.lvlMin.shift(); }
  var dayCut = now - client.lvlDays * 86400;
  while (client.lvlDay.length > 0 && client.lvlDay[0][0] < dayCut) { client.lvlDay.shift(); }

  var lastWrite = client.lvlLastWrite || 0;
  if (wrote && (force || (now - lastWrite) >= 5)) {
    client.lvlLastWrite = now;
    try { set_variable("lvl_min", JSON.stringify(client.lvlMin)); } catch (e) {}
    try { set_variable("lvl_day", JSON.stringify(client.lvlDay)); } catch (e) {}
    run_function("lvl_render", [], "levelgraph");
  }
}