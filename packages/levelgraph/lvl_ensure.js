// Two independent ring buffers, each bounded by construction:
//   lvl_day  one point per calendar day, trailing 100 days  (long-term trend)
//   lvl_min  one point per wall-clock minute, trailing 120  (current session)
// Both store [unixSeconds, level, nl]. Progress is level + nl/100.
function lvlDayKey(t) {
  var d = new Date(t * 1000);
  return d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
}
function lvlLoadArr(name) {
  var a = [];
  try { a = JSON.parse(get_variable(name)) || []; } catch (e) { a = []; }
  if (Object.prototype.toString.call(a) !== "[object Array]") { a = []; }
  return a;
}
function lvlNum(name, def, lo, hi) {
  var v = def;
  try { if (get_variable(name) !== undefined) { v = parseInt(get_variable(name), 10); } } catch (e) { v = def; }
  if (!v || isNaN(v) || v < lo) { v = def; }
  if (v > hi) { v = hi; }
  return v;
}

if (!client.lvlMin) { client.lvlMin = lvlLoadArr("lvl_min"); }

if (!client.lvlDay) {
  var day = lvlLoadArr("lvl_day");
  if (day.length === 0) {
    // One-time migration: fold any legacy lvl_hist down to one point per day
    // so previously collected history is not thrown away.
    var old = lvlLoadArr("lvl_hist");
    var lastKey = "";
    for (var mi = 0; mi < old.length; mi++) {
      var k = lvlDayKey(old[mi][0]);
      if (k === lastKey && day.length > 0) { day[day.length - 1] = old[mi]; }
      else { day.push(old[mi]); lastKey = k; }
    }
    if (day.length > 0) {
      try { set_variable("lvl_day", JSON.stringify(day)); } catch (e) {}
    }
  }
  client.lvlDay = day;
}

if (client.lvlGraphLong === undefined) {
  var gl = "1";
  try { if (get_variable("lvl_graph_long") !== undefined) { gl = String(get_variable("lvl_graph_long")); } } catch (e) { gl = "1"; }
  client.lvlGraphLong = (gl !== "0");
}
if (client.lvlGraphSess === undefined) {
  var gs = "1";
  try { if (get_variable("lvl_graph_sess") !== undefined) { gs = String(get_variable("lvl_graph_sess")); } } catch (e) { gs = "1"; }
  client.lvlGraphSess = (gs !== "0");
}
if (client.lvlChartH === undefined) { client.lvlChartH = lvlNum("lvl_graph_h", 105, 40, 400); }
if (client.lvlDays === undefined) { client.lvlDays = lvlNum("lvl_span_days", 100, 7, 365); }
if (client.lvlMins === undefined) { client.lvlMins = lvlNum("lvl_span_mins", 120, 15, 720); }