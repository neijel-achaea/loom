run_function("lvl_ensure", [], "levelgraph");
var which = args[1] || "";
var v = args[2] ? parseInt(args[2], 10) : 0;
if (!which) { display_notice("[level] windows: session " + client.lvlMins + " min, long " + client.lvlDays + " days. Usage: lvlspan session 15-720 | lvlspan long 7-365.", "cyan"); }
else if (!v) { display_notice("[level] " + which + " window is " + (which === "session" ? client.lvlMins + " minutes" : client.lvlDays + " days") + ".", "cyan"); }
else if (which === "session" && (v < 15 || v > 720)) { display_notice("[level] session window must be 15-720 minutes.", "yellow"); }
else if (which === "long" && (v < 7 || v > 365)) { display_notice("[level] long window must be 7-365 days.", "yellow"); }
else {
  if (which === "session") { client.lvlMins = v; try { set_variable("lvl_span_mins", String(v)); } catch (e) {} }
  else { client.lvlDays = v; try { set_variable("lvl_span_days", String(v)); } catch (e) {} }
  run_function("lvl_render", [], "levelgraph");
  display_notice("[level] " + which + " window set to " + v + (which === "session" ? " minutes." : " days.") + " Points beyond it drop off at the next sample.", "cyan");
}