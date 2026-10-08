if (!client.loom || !client.loom.fishingstats || !client.loom.fishingstats.session) run_function("fishingstats_setup", [], "fishingstats");
var FS = client.loom.fishingstats;
var ft = parseInt(args[1], 10) || 0;
if (ft > 0) {
  FS.session.castFt = (FS.session.castFt || 0) + ft;
  FS.session.castN = (FS.session.castN || 0) + 1;
}