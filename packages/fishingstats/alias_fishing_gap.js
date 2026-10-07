run_function("fsh_ensure", [], "fishingstats");
var m = args[1] ? parseInt(args[1], 10) : 0;
if (!m) { display_notice("[fishingstats] sessions are filed automatically after " + client.fshGap + " minutes idle. Usage: fpgap 5-1440.", "cyan"); }
else if (m < 5 || m > 1440) { display_notice("[fishing] pick a gap between 5 and 1440 minutes.", "yellow"); }
else {
  client.fshGap = m;
  try { set_variable("fsh_gap", String(m)); } catch (e) {}
  display_notice("[fishingstats] idle gap set to " + m + " minutes.", "cyan");
}