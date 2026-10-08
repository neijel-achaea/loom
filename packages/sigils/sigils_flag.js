// sigils_flag -- records one reading from S.flag = { id, name, months, flame }.
// months/flame < 0 means none / no reading.
var S = client.loom.sigils;
var f = S.flag || {};
var fid = f.id;
var fmo = (f.months === null || f.months === undefined) ? -1 : f.months;
var ffl = (f.flame === null || f.flame === undefined || fmo < 0) ? -1 : f.flame;

if (fid !== null && fid !== undefined && fid !== "") {
  var key = String(fid);
  var nm = f.name ? String(f.name) : "?";
  var thr = get_variable("sigils_threshold");
  if (thr === null || thr === undefined) thr = 10;
  var bad = get_variable("sigils_flagged") || {};
  var ign = get_variable("sigils_ignored") || {};
  var prev = bad[key];

  var monoBad = fmo < thr;
  var flameBad = ffl < thr;

  if (ign[key] || (!monoBad && !flameBad)) {
    // Healthy (or ignored): drop any earlier flag for this room.
    if (prev) {
      delete bad[key];
      set_variable("sigils_flagged", bad);
      if (!ign[key]) display_notice("[sigils] " + nm + " (" + key + ") -- all good now.", "lime");
    }
  } else {
    bad[key] = { id: key, name: nm, months: fmo, flame: ffl, t: Date.now() };
    set_variable("sigils_flagged", bad);

    // Only announce new flags or changed readings, not every re-probe.
    if (!prev || prev.months !== fmo || prev.flame !== ffl) {
      var parts = [];
      if (monoBad) {
        if (fmo < 0) parts.push("no monolith");
        else if (fmo === 0) parts.push("monolith under a month");
        else parts.push("monolith " + fmo + (fmo === 1 ? " month" : " months"));
      }
      if (flameBad && fmo >= 0) {
        if (ffl < 0) parts.push("no flame sigil");
        else if (ffl === 0) parts.push("flame under a month");
        else parts.push("flame " + ffl + (ffl === 1 ? " month" : " months"));
      }
      display_notice("[sigils] " + nm + " (" + key + ") -- " + parts.join(", "), "orange");
    }
  }
}
