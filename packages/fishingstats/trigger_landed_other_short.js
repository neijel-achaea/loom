if (!client.loom || !client.loom.fishingstats || !client.loom.fishingstats.session) run_function("fishingstats_setup", [], "fishingstats");
var FS = client.loom.fishingstats;
FS.inp = { angler: args[1], species: args[2], oz: (parseInt(args[3], 10) || 0) * 16 + (parseInt(args[4], 10) || 0) };
run_function("fishingstats_record", [], "fishingstats");