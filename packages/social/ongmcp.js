// Own name (Char.Name) for highlighting, city (Char.Status) for the enemies list.
if (!client.loom || !client.loom.social || !client.loom.social.lists) run_function("social_setup", [], "social");
var S = client.loom.social;
if (args.gmcp_method == "Char.Name" && args.gmcp_args.name) {
  S.me = String(args.gmcp_args.name).toLowerCase();
  // You just logged in: the Online tab counts those already on from now.
  S.loginAt = Date.now();
}
if (args.gmcp_method == "Char.Status") {
  if (args.gmcp_args.name) S.me = String(args.gmcp_args.name).toLowerCase();
  if (args.gmcp_args.city !== undefined) S.city = String(args.gmcp_args.city).replace(/\s*\(.*\)\s*$/, "").toLowerCase();
}
