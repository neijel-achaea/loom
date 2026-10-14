// CIVIC AIDE ON | OFF | TITLE <title> | CLAN <clan>
var C = client.loom.civic;
var what = String(C.argv[0] || "").toLowerCase();
var rest = C.argv.slice(1).join(" ");
var title = get_variable("civic_aide_title");
var clan = get_variable("civic_aide_clan");

if (what === "title") {
  if (rest) { set_variable("civic_aide_title", rest); title = rest; }
  display_notice("[civic] aide title: " + (title || "not set"), rest ? "lime" : "cyan");
} else if (what === "clan") {
  if (rest) { set_variable("civic_aide_clan", rest.toLowerCase()); clan = rest.toLowerCase(); }
  display_notice("[civic] novice clan: " + (clan || "not set"), rest ? "lime" : "cyan");
} else if (what === "on" || what === "off") {
  if (!clan) {
    display_notice("[civic] set your novice clan first: CIVIC AIDE CLAN <clan>.", "orange");
  } else if (get_variable("pauseTriggers") == "on") {
    display_notice("[civic] triggers are paused; try again when LOOM PAUSE is off.", "orange");
  } else {
    var on = (what === "on");
    var label = title || "Aide";
    send_command("city guide " + (on ? "available" : "unavailable"));
    send_command("clan switch " + clan);
    send_command(on ? "newbieon" : "newbieoff");
    if (on) send_command("clt " + label + " on duty. If you have any questions or need anything, don't hesitate to ask!");
    else send_command("clt " + label + " off duty. If you have any questions or need anything, still don't hesitate to ask!");
    set_variable("civic_aide_on", what);
    display_notice("[civic] aide " + (on ? "ON" : "OFF") + " duty.", "lime");
  }
} else {
  display_notice("[civic] use CIVIC AIDE ON, OFF, TITLE <title> or CLAN <clan>.", "orange");
}
