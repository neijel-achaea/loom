run_function("fsh_ensure", [], "fishingstats");
client.fshIn = { angler: client.fshMe, species: args[1], oz: (parseInt(args[2], 10) || 0) * 16 + (parseInt(args[3], 10) || 0) };
run_function("fsh_record", [], "fishingstats");