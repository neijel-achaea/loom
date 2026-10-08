if (!client.loom || !client.loom.social || !client.loom.social.lists) run_function("social_setup", [], "social");
var S = client.loom.social;
if (S.loadEnemies) {
  var soE = S.lists.enemies;
  for (var soK in soE) delete soE[soK];
  for (var soN in S.loadEnemies) soE[soN] = true;
  S.loadEnemies = null;
  run_function("social_save", [], "social");
  var soHave = Object.keys(soE).length;
  var soWant = parseInt(args[1], 10);
  display_notice("[social] city enemies loaded: " + soHave + " / " + soWant + (soHave !== soWant ? " (count mismatch)" : "") + ".", soHave === soWant ? "cyan" : "orange");
}
