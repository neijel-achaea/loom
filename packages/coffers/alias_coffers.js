// COFFERS [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.coffers || !client.loom.coffers.f) run_function("coffers_setup", [], "coffers");
var CO = client.loom.coffers;
var coW = String(args[1] || "").trim().toLowerCase().split(/\s+/);
CO.args = [coW[0] || "", coW[1] || "", coW[2] || ""];
run_function("coffers_cmd", [], "coffers");
