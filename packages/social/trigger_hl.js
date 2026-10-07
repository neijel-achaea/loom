if (!client.hl) {
  client.hl = {
    groups: ["family", "enemies", "order", "house", "city", "allies", "friends"],
    color:  { family: "#30c4ff", enemies:"#ff5f5f", order:"#e0b8ff", house:"#b8ff29", city:"#27f5c5", allies:"#ff9f4f", friends:"#ffd77f" },
    vari:   { family:"hlFamily", enemies:"hlEnemies", order:"hlOrder", house:"hlHouse", city:"hlCity", allies:"hlAllies", friends:"hlFriends" },
    re: /[A-Z][a-z]+/g
  };
  client.hl.groups.forEach(function (g) {
    client.hl[g] = {};
    (get_variable(client.hl.vari[g]) || "").split(",").forEach(function (n) {
      n = n.trim(); if (n.length) client.hl[g][n] = true;
    });
  });
  client.hl.save = function (g) {
    set_variable(client.hl.vari[g], Object.keys(client.hl[g]).join(","));
  };
}

var line = args[1];
if (line) {
  var re = client.hl.re; re.lastIndex = 0;
  var m, name, groups = client.hl.groups, i;
  while ((m = re.exec(line)) !== null) {
    name = m[0].toLowerCase();
    for (i = 0; i < groups.length; i++) {
      if (client.hl[groups[i]][name]) {
        colorize_current_line(m.index, m[0].length, client.hl.color[groups[i]], "");
        break;
      }
    }
  }
}