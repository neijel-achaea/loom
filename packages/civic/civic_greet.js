// CIVIC GREET <name> [CT|CLT] -- both channels by default.
var C = client.loom.civic;
var who = String(C.argv[0] || "");
var where = String(C.argv[1] || "both").toLowerCase();
var clan = get_variable("civic_aide_clan");

if (!who) {
  display_notice("[civic] use CIVIC GREET <name> [CT|CLT].", "orange");
} else if (where !== "both" && where !== "ct" && where !== "clt") {
  display_notice("[civic] greet on CT, CLT, or leave it out for both.", "orange");
} else if (where !== "ct" && !clan) {
  display_notice("[civic] set your novice clan first: CIVIC AIDE CLAN <clan>.", "orange");
} else {
  who = who.charAt(0).toUpperCase() + who.slice(1).toLowerCase();
  if (where === "ct" || where === "both") {
    send_command("ct Welcome, " + who + "! You can talk here with CT message. Please have a look at CHELP WELCOME when you have some time.");
  }
  if (where === "clt") {
    send_command("clan switch " + clan);
    send_command("clt Welcome, " + who + "! You can talk here with CLT message. Please have a look at CLHELP WELCOME to learn how to progress through your novicehood. Don't hesitate to ask any questions here.");
  }
  if (where === "both") {
    send_command("clan switch " + clan);
    send_command("clt And welcome here too! You can talk with CLT message. Please have a look at CLHELP WELCOME to learn how to progress through your novicehood. Don't hesitate to ask any questions here.");
  }
}
