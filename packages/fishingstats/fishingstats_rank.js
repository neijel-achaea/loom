// Stores one row of a fishing rankings table.
//   FS.rank = { species, who, lb, oz, year }
// RANKINGS FISHING prints two tables with identical layout: the year's bests
// and the all-time bests since the last reset. Rows are attributed by which
// header was seen last, with the row's own year as a second check, so the
// all-time figures cannot overwrite the yearly ones.
if (!client.loom || !client.loom.fishingstats || !client.loom.fishingstats.session) run_function("fishingstats_setup", [], "fishingstats");
var FS = client.loom.fishingstats;
var r = FS.rank;
FS.rank = null;
if (r && r.species) {
  var oz = (parseInt(r.lb, 10) || 0) * 16 + (parseInt(r.oz, 10) || 0);
  var key = String(r.species).toLowerCase();
  var yr = parseInt(r.year, 10) || 0;
  var mode = FS.rankMode || "";

  if (mode === "year" && yr === FS.rec.year) {
    if (!FS.rec.f[key] || oz > FS.rec.f[key][0]) {
      FS.rec.f[key] = [oz, String(r.who)];
      try { set_variable("fishingstats_records", JSON.stringify(FS.rec)); } catch (e) {}
    }
  } else if (mode === "reset") {
    // Kept for later use. Nothing displays these yet.
    if (!FS.rec.a) { FS.rec.a = {}; }
    if (!FS.rec.a[key] || oz > FS.rec.a[key][0]) {
      FS.rec.a[key] = [oz, String(r.who)];
      try { set_variable("fishingstats_records", JSON.stringify(FS.rec)); } catch (e) {}
    }
  }
}