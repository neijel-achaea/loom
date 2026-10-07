run_function("fsh_ensure", [], "fishingstats");
client.fshEvt = { angler: client.fshMe, type: "hook" };
run_function("fsh_event", [], "fishingstats");