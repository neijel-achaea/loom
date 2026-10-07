run_function("fsh_ensure", [], "fishingstats");
var yr = parseInt(args[1], 10) || 0;
client.fshRankMode = "year";
// The table is complete, so rebuild from scratch rather than merging into
// whatever was there before.
client.fshRec.year = yr;
client.fshRec.f = {};
try { set_variable("fsh_records", JSON.stringify(client.fshRec)); } catch (e) {}