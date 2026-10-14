// dmgchart_lasts -- health lasts for the live fight, into
// client.loom.dmgchart.lasts ({secs, drop, span, start}) or null, and the
// DMGCHART WARN notice (#93). Run on every Char.Vitals reading during a
// fight and after every hit taken, whatever the tab shows, so the warning
// follows the live fight even while a recording is on screen.
//
// Health lasts is current health over how fast health really fell across
// the last d.window seconds (or the fight so far), from the Char.Vitals
// readings, so every hit and heal counts and nothing counts twice. Only while
// health is falling, after a warm-up of 3s and 2 hits taken (#153).
//
// The warning fires once when the figure drops below d.warn seconds, and
// re-arms once health would last half as much again as d.warn at the rate
// that is falling now, or (when it isn't falling) at the rate that set the
// warning off; so a sip that only pauses the fall doesn't warn again. A new
// fight starts armed.
var d = client.loom.dmgchart;
var f = d.fight;
d.lasts = null;
if (f && f.incTotal > 0 && Date.now() - f.last <= d.gap * 1000) {
  var hpNow = d.hp;
  var wNow = Date.now();
  var wFrom = Math.max(wNow - d.window * 1000, f.start);
  var wSpan = (wNow - wFrom) / 1000;
  var rc = d.recent || [];
  var hpThen = null;
  for (var ri = 0; ri < rc.length; ri++) {
    if (rc[ri].t <= wFrom) { hpThen = rc[ri].hp; } else { if (hpThen === null) hpThen = rc[ri].hp; break; }
  }
  if (typeof hpNow === "number" && !isNaN(hpNow) && hpNow > 0 && hpThen !== null && wSpan >= 3 && f.hits && f.hits.inc.n >= 2 && hpThen > hpNow) {
    var drop = (hpThen - hpNow) / wSpan;
    d.lasts = { secs: hpNow / drop, drop: drop, span: wSpan, start: f.start };
  }
  if (d.warn > 0) {
    if (d.lasts && d.lasts.secs < d.warn) {
      if (!f.warned) {
        f.warned = true;
        f.warnDrop = d.lasts.drop;
        var ls = d.lasts.secs;
        display_notice("[dmgchart] health lasts ~" + (ls < 10 ? ls.toFixed(1) : Math.round(ls)) + "s (losing " + Math.round(d.lasts.drop) + "/s over the last " + Math.round(d.lasts.span) + "s)", "orange");
      }
    } else if (f.warned) {
      var reDrop = d.lasts ? d.lasts.drop : f.warnDrop;
      if (typeof hpNow === "number" && hpNow / reDrop > d.warn * 1.5) f.warned = false;
    }
  }
}
