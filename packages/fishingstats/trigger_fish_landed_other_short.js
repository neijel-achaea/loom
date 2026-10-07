run_function("fsh_ensure", [], "fishingstats");
client.fshIn = { angler: args[1], species: args[2], oz: (parseInt(args[3], 10) || 0) * 16 + (parseInt(args[4], 10) || 0) };
run_function("fsh_record", [], "fishingstats");