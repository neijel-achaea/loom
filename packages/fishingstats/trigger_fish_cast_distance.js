run_function("fsh_ensure", [], "fishingstats");
var ft = parseInt(args[1], 10) || 0;
if (ft > 0) {
  client.fsh.castFt = (client.fsh.castFt || 0) + ft;
  client.fsh.castN = (client.fsh.castN || 0) + 1;
}