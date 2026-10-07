run_function("fsh_ensure", [], "fishingstats");
client.fshEvt = { angler: args[1], type: "cast" };
run_function("fsh_event", [], "fishingstats");