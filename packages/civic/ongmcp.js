// Civic follows the city itself and fills in that city's known defaults for
// any setting not chosen yet.
if (args.gmcp_method == "Char.Status" && args.gmcp_args.city) {
  if (!client.loom) client.loom = {};
  if (!client.loom.civic) run_function("civic_setup", [], "civic");
  var C = client.loom.civic;
  C.city = String(args.gmcp_args.city).replace(/\s*\(.*\)\s*$/, "");
  var known = (C.cities || {})[C.city.toLowerCase()];
  if (known) {
    var keys = Object.keys(known);
    for (var i = 0; i < keys.length; i++) {
      var v = get_variable("civic_" + keys[i]);
      if (v === null || v === undefined || v === "") set_variable("civic_" + keys[i], known[keys[i]]);
    }
  }
}
