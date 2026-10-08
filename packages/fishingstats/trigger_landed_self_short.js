if (!client.loom || !client.loom.fishingstats || !client.loom.fishingstats.session) run_function("fishingstats_setup", [], "fishingstats");
var FS = client.loom.fishingstats;
FS.inp = { angler: FS.me, species: args[1], oz: (parseInt(args[2], 10) || 0) * 16 + (parseInt(args[3], 10) || 0) };
run_function("fishingstats_record", [], "fishingstats");