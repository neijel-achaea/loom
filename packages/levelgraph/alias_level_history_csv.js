run_function("lvl_ensure", [], "levelgraph");
var which = args[1] || "long";
var hs = (which === "session") ? (client.lvlMin || []) : (client.lvlDay || []);
display_notice("[level] " + which + " buffer, " + hs.length + " point(s):", "cyan");
display_notice("datetime,unix,level,nl,progress", "white");
for (var i = 0; i < hs.length; i++) {
  var d = new Date(hs[i][0] * 1000);
  var mm = d.getMonth() + 1;
  var dd = d.getDate();
  var hh = d.getHours();
  var mi = d.getMinutes();
  var iso = d.getFullYear() + "-" + (mm < 10 ? "0" : "") + mm + "-" + (dd < 10 ? "0" : "") + dd + " " + (hh < 10 ? "0" : "") + hh + ":" + (mi < 10 ? "0" : "") + mi;
  display_notice(iso + "," + hs[i][0] + "," + hs[i][1] + "," + hs[i][2] + "," + (Math.round((hs[i][1] + hs[i][2] / 100) * 100) / 100), "white");
}