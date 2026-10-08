// "Enemies of <your city>:" -- start replacing the enemies list with the
// names that follow, up to "Total: n". Only for your own city (from GMCP).
if (!client.loom || !client.loom.social || !client.loom.social.lists) run_function("social_setup", [], "social");
var S = client.loom.social;
if (S.city && args[1].toLowerCase().indexOf(S.city) >= 0) {
  S.loadEnemies = {};
}
