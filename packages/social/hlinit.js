if (!client.hl) {
  client.hl = {
    groups: ["family", "enemies", "order", "house", "city", "allies", "friends"],   // priority order
    color:  {
      family:  "#30c4ff",
      enemies: "#ff5f5f",
      order:   "#e0b8ff",
      house:   "#b8ff29",
      city:    "#27f5c5",
      allies:  "#ff9f4f",
      friends: "#ffd77f"
    },
    vari:   {
      family:  "hlFamily",
      enemies: "hlEnemies",
      order:   "hlOrder",
      house:   "hlHouse",
      city:    "hlCity",
      allies:  "hlAllies",
      friends: "hlFriends"
    },
    re: /[A-Z][a-z]+/g
  };
  client.hl.defColor = {};                         // <-- holds the hardcoded defaults
  client.hl.groups.forEach(function (g) {
    client.hl.defColor[g] = client.hl.color[g];    // <-- snapshot default before any override

    client.hl[g] = {};
    (get_variable(client.hl.vari[g]) || "").split(",").forEach(function (n) {
      n = n.trim();
      if (n.length) client.hl[g][n] = true;
    });

    var savedColor = get_variable("hlColor_" + g);
    if (savedColor && savedColor.length) client.hl.color[g] = savedColor;
  });
  client.hl.save = function (g) {
    set_variable(client.hl.vari[g], Object.keys(client.hl[g]).join(","));
  };
}