// "Enemies of <your city>:" -- start replacing the enemies list with the
// names that follow, up to "Total: n". Only your own city's list (city from
// GMCP); house, order or other cities' lists are left alone.
if (!client.loom || !client.loom.social || !client.loom.social.lists) run_function("social_setup", [], "social");
var S = client.loom.social;
// Cities whose list header doesn't carry the city's name.
var soHeaders = { cyrene: "thalassan empire" };
var soHead = args[1].toLowerCase();
var soMine = S.city && (soHead.indexOf(S.city) >= 0 || (soHeaders[S.city] && soHead.indexOf(soHeaders[S.city]) >= 0));
if (soMine) {
  S.loadEnemies = {};
} else if (S.debug) {
  display_notice("[social] enemies list not loaded: '" + args[1] + "' isn't " + (S.city || "your city (none known yet)") + ".", "cyan");
}
