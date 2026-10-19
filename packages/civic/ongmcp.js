// Civic follows the city itself and fills in that city's known defaults for
// any setting not chosen yet.
// A payload that came empty or as something other than an object reads as
// an empty one (#135).
var cvG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};
if (args.gmcp_method == "Char.Status" && cvG.city) {
  if (!client.loom) client.loom = {};
  if (!client.loom.civic) run_function("civic_setup", [], "civic");
  var C = client.loom.civic;
  C.city = String(cvG.city).replace(/\s*\(.*\)\s*$/, "");
  var known = (C.cities || {})[C.city.toLowerCase()];
  if (known) {
    var keys = Object.keys(known);
    for (var i = 0; i < keys.length; i++) {
      var v = get_variable("civic_" + keys[i]);
      if (v === null || v === undefined || v === "") set_variable("civic_" + keys[i], known[keys[i]]);
    }
  }
}
