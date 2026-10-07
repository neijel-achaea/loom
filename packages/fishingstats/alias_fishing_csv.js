run_function("fsh_ensure", [], "fishingstats");
var s = client.fsh;
display_notice("angler,landed,casts,hooks,total_oz,best_oz,best_species", "white");
var k;
for (k in s.anglers) {
  if (s.anglers.hasOwnProperty(k)) {
    var a = s.anglers[k];
    display_notice(k + "," + a.n + "," + (a.casts || 0) + "," + (a.hooks || 0) + "," + a.oz + "," + a.best + "," + a.bestSp, "white");
  }
}
display_notice("species,caught,total_oz,best_oz,best_by", "white");
for (k in s.species) {
  if (s.species.hasOwnProperty(k)) {
    var f = s.species[k];
    display_notice(k + "," + f.n + "," + f.oz + "," + f.best + "," + f.bestBy, "white");
  }
}