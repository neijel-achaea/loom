// ROOM [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.room || !client.loom.room.raw) run_function("room_setup", [], "room");
var R = client.loom.room;
var rmW = String(args[1] || "").trim().toLowerCase().split(/\s+/);
var rmSub = rmW[0];
function rmSay(t, c) { display_notice("[room] " + t, c || "cyan"); }
if (rmSub === "" || rmSub === "status") {
  var rmI = R.info || {};
  var rmP = 0, rmMo = 0, rmIt = 0;
  for (var k in R.players) { if (R.players.hasOwnProperty(k) && k.toLowerCase() !== String(R.me).toLowerCase()) rmP++; }
  for (var j in R.items) { if (R.items.hasOwnProperty(j)) { if (/m/.test(R.items[j].attrib || "")) rmMo++; else rmIt++; } }
  rmSay(R.info ? (String(rmI.name).replace(/\s*\((?:indoors|outdoors)\)\s*$/i, "") + " (" + rmI.num + "), " + rmI.area + ": " + rmP + " player" + (rmP === 1 ? "" : "s") + ", " + rmMo + " mob" + (rmMo === 1 ? "" : "s") + ", " + rmIt + " item" + (rmIt === 1 ? "" : "s") + ".") : "no room data yet: move or LOOK.");
  rmSay("the Here tab shows it; the description starts " + (R.descOpen ? "open" : "folded") + ". ROOM HELP for commands.");
} else if (rmSub === "help") {
  run_function("room_help", [], "room");
} else if (rmSub === "desc") {
  var rmD = rmW[1] || "";
  if (rmD === "open" || rmD === "folded" || rmD === "fold") {
    R.descOpen = rmD === "open";
    set_variable("room_desc", R.descOpen ? "open" : "folded");
    try { document.body.classList.toggle("loom-room-desc-open", R.descOpen); } catch (e) {}
    rmSay("the description starts " + (R.descOpen ? "open" : "folded") + " now.", "lime");
  } else {
    rmSay("the description starts " + (R.descOpen ? "open" : "folded") + ". ROOM DESC OPEN or FOLDED to change it; clicking it flips it too.");
  }
} else if (rmSub === "debug") {
  // The last payload of each GMCP message the tab reads, as JSON.
  var rmK = Object.keys(R.raw);
  if (!rmK.length) rmSay("no room GMCP seen yet.");
  for (var rmX = 0; rmX < rmK.length; rmX++) {
    var rmS = JSON.stringify(R.raw[rmK[rmX]]);
    rmSay(rmK[rmX] + " " + (rmS.length > 600 ? rmS.slice(0, 600) + "…" : rmS), "orange");
  }
  rmSay("me=" + (R.me || "?") + " players=" + Object.keys(R.players).length + " items=" + Object.keys(R.items).length, "orange");
} else {
  rmSay("unknown command '" + rmSub + "'. ROOM HELP for commands.", "orange");
}
run_function("room_render", [], "room");
