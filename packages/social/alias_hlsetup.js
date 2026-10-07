// ---- hlsetup: build the system directly, no run_function ----
var groups = ["family","enemies","order","house","city","allies","friends"];
var defColor = { family:"#30c4ff", enemies:"#ff5f5f", order:"#e0b8ff", house:"#b8ff29", city:"#27f5c5", allies:"#ff9f4f", friends:"#ffd77f" };
var vari = { family:"hlFamily", enemies:"hlEnemies", order:"hlOrder", house:"hlHouse", city:"hlCity", allies:"hlAllies", friends:"hlFriends" };

client.hl = { groups: groups, color: {}, vari: vari, defColor: {}, re: /[A-Z][a-z]+/g };
groups.forEach(function (g) {
  client.hl.defColor[g] = defColor[g];
  var saved = get_variable("hlColor_" + g);
  if (!saved || !saved.length) { set_variable("hlColor_" + g, defColor[g]); saved = defColor[g]; }
  client.hl.color[g] = saved;
  client.hl[g] = {};
  (get_variable(vari[g]) || "").split(",").forEach(function (n) {
    n = n.trim(); if (n.length) client.hl[g][n] = true;
  });
});
client.hl.save = function (g) { set_variable(client.hl.vari[g], Object.keys(client.hl[g]).join(",")); };

display_notice("[social] ready - groups: " + groups.join(", "), "cyan");