// mono_flag -- inputs are read from variables, not arguments:
//   mono_f_id, mono_f_name, mono_f_months, mono_f_flame
//   months/flame < 0 means none / no reading
var fid = get_variable("mono_f_id");
var fnm = get_variable("mono_f_name");
var fmo = get_variable("mono_f_months");
var ffl = get_variable("mono_f_flame");
if (fmo === null || fmo === undefined) fmo = -1;
if (ffl === null || ffl === undefined || fmo < 0) ffl = -1;

if (fid !== null && fid !== undefined && fid !== "") {
  var key = String(fid);
  var nm = fnm ? String(fnm) : "?";
  var thr = get_variable("mono_threshold");
  if (thr === null || thr === undefined) thr = 10;
  var bad = get_variable("mono_bad") || {};
  var ign = get_variable("mono_ignore") || {};
  var prev = bad[key];

  var monoBad = fmo < thr;
  var flameBad = ffl < thr;

  if (ign[key] || (!monoBad && !flameBad)) {
    // Healthy (or ignored): drop any earlier flag for this room.
    if (prev) {
      delete bad[key];
      set_variable("mono_bad", bad);
      if (!ign[key]) display_notice("[eleusis] " + nm + " (" + key + ") -- all good now.", "lime");
    }
  } else {
    bad[key] = { id: key, name: nm, months: fmo, flame: ffl, t: Date.now() };
    set_variable("mono_bad", bad);

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
      display_notice("[eleusis] " + nm + " (" + key + ") -- " + parts.join(", "), "orange");
    }
  }
}
