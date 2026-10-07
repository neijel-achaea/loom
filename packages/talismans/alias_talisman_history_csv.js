run_function("tal_ensure", [], "talismans");
var hs = client.talHist || [];
var start = hs.length > 300 ? hs.length - 300 : 0;
if (start > 0) { display_notice("[talismans] showing the most recent 300 of " + hs.length + " points.", "yellow"); }
display_notice("date,unix,common,rare,total", "white");
for (var i = start; i < hs.length; i++) {
  var d = new Date(hs[i][0] * 1000);
  var mm = d.getMonth() + 1;
  var dd = d.getDate();
  var iso = d.getFullYear() + "-" + (mm < 10 ? "0" : "") + mm + "-" + (dd < 10 ? "0" : "") + dd;
  display_notice(iso + "," + hs[i][0] + "," + hs[i][1] + "," + hs[i][2] + "," + (hs[i][1] + hs[i][2]), "white");
}