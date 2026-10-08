if (!client.loom || !client.loom.social || !client.loom.social.lists) run_function("social_setup", [], "social");
var S = client.loom.social;
if (S.loadEnemies) {
  var soParts = args[1].split(",");
  for (var soI = 0; soI < soParts.length; soI++) {
    var soNm = soParts[soI].trim().toLowerCase();
    if (soNm.length && soNm !== "none") S.loadEnemies[soNm] = true;
  }
}
