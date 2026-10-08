if (!client.loom || !client.loom.fishingstats || !client.loom.fishingstats.session) run_function("fishingstats_setup", [], "fishingstats");
var FS = client.loom.fishingstats;
FS.rank = { species: args[1], who: args[2], lb: args[3], oz: args[4], year: args[5] };
run_function("fishingstats_rank", [], "fishingstats");