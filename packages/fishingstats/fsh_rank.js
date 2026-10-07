// Stores one row of a fishing rankings table.
//   client.fshRank = { species, who, lb, oz, year }
// RANKINGS FISHING prints two tables with identical layout: the year's bests
// and the all-time bests since the last reset. Rows are attributed by which
// header was seen last, with the row's own year as a second check, so the
// all-time figures cannot overwrite the yearly ones.
run_function("fsh_ensure", [], "fishingstats");
var r = client.fshRank;
client.fshRank = null;
if (r && r.species) {
  var oz = (parseInt(r.lb, 10) || 0) * 16 + (parseInt(r.oz, 10) || 0);
  var key = String(r.species).toLowerCase();
  var yr = parseInt(r.year, 10) || 0;
  var mode = client.fshRankMode || "";

  if (mode === "year" && yr === client.fshRec.year) {
    if (!client.fshRec.f[key] || oz > client.fshRec.f[key][0]) {
      client.fshRec.f[key] = [oz, String(r.who)];
      try { set_variable("fsh_records", JSON.stringify(client.fshRec)); } catch (e) {}
    }
  } else if (mode === "reset") {
    // Kept for later use. Nothing displays these yet.
    if (!client.fshRec.a) { client.fshRec.a = {}; }
    if (!client.fshRec.a[key] || oz > client.fshRec.a[key][0]) {
      client.fshRec.a[key] = [oz, String(r.who)];
      try { set_variable("fsh_records", JSON.stringify(client.fshRec)); } catch (e) {}
    }
  }
}