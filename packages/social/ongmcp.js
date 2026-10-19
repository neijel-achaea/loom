// Own name (Char.Name) for highlighting, city (Char.Status) for the enemies list.
if (!client.loom || !client.loom.social || !client.loom.social.lists) run_function("social_setup", [], "social");
var S = client.loom.social;
// A payload that came empty or as something other than an object reads as
// an empty one (#135).
var soG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};
if (args.gmcp_method == "Char.Name" && soG.name) {
  S.me = String(soG.name).toLowerCase();
  // You just logged in: the Online tab counts those already on from now.
  S.loginAt = Date.now();
}
if (args.gmcp_method == "Char.Status") {
  if (soG.name) S.me = String(soG.name).toLowerCase();
  if (soG.city !== undefined) S.city = String(soG.city).replace(/\s*\(.*\)\s*$/, "").toLowerCase();
}
