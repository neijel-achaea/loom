if (!client.loom || !client.loom.fishingstats || !client.loom.fishingstats.session) run_function("fishingstats_setup", [], "fishingstats");
var FS = client.loom.fishingstats;
var yr = parseInt(args[1], 10) || 0;
FS.rankMode = "year";
// The table is complete, so rebuild from scratch rather than merging into
// whatever was there before.
FS.rec.year = yr;
FS.rec.f = {};
try { set_variable("fishingstats_records", JSON.stringify(FS.rec)); } catch (e) {}