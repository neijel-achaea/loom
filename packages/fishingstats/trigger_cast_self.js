if (!client.loom || !client.loom.fishingstats || !client.loom.fishingstats.session) run_function("fishingstats_setup", [], "fishingstats");
var FS = client.loom.fishingstats;
FS.evt = { angler: FS.me, type: "cast" };
run_function("fishingstats_event", [], "fishingstats");