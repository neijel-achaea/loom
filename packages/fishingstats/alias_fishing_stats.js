run_function("fsh_ensure", [], "fishingstats");
var s = client.fsh;
var now = Math.floor(new Date().getTime() / 1000);
var el = now - (s.start || now);
if (el < 1) { el = 1; }
display_notice("[fishing] " + s.n + " catches over " + Math.round(el / 60) + " min", "cyan");
var k;
for (k in s.anglers) {
  if (s.anglers.hasOwnProperty(k)) {
    var a = s.anglers[k];
    display_notice("[fishingstats] " + k + ": " + a.n + " (" + Math.round((a.n / s.n) * 100) + "%), " + Math.floor(a.oz / 16) + "lb " + (a.oz % 16) + "oz total, best " + Math.floor(a.best / 16) + "lb " + (a.best % 16) + "oz " + a.bestSp, "cyan");
  }
}
run_function("fsh_render", [], "fishingstats");