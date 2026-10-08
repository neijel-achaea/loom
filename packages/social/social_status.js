if (!client.loom || !client.loom.social || !client.loom.social.lists) run_function("social_setup", [], "social");
var S = client.loom.social;
var soCounts = [];
var soWatch = [];
for (var soI = 0; soI < S.groups.length; soI++) {
  soCounts.push(S.groups[soI] + " " + Object.keys(S.lists[S.groups[soI]]).length);
  if (S.watch[S.groups[soI]]) soWatch.push(S.groups[soI]);
}
display_notice("[social] lists: " + soCounts.join(", ") + ".", "cyan");
display_notice("[social] polling " + String(get_variable("social_poll")).toUpperCase()
  + (S.prev ? " (" + Object.keys(S.prev).length + " online)" : " (not primed yet)")
  + ", watching " + (soWatch.length ? soWatch.join(", ") : "nothing") + ". SOCIAL HELP for commands.", "cyan");
