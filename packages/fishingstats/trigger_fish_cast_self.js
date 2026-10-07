run_function("fsh_ensure", [], "fishingstats");
client.fshEvt = { angler: client.fshMe, type: "cast" };
run_function("fsh_event", [], "fishingstats");