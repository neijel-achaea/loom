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
} else if (rmSub === "novice") {
  // ROOM NOVICE (#389): the titles that get the green leaf.
  var rmNv = rmW[1] || "", rmNw = String(args[1] || "").trim().split(/\s+/).slice(2);
  var rmTl = function () { return R.newbieTitles.length ? R.newbieTitles.join(", ") : "none"; };
  if (rmNv === "") {
    rmSay("titles that get the green leaf: " + rmTl() + ". ROOM NOVICE ADD|REMOVE <title>, or RESET for " + R.newbieDefault.join(", ") + ".");
  } else if (rmNv === "add" || rmNv === "remove") {
    if (rmNw.length !== 1 || !/^[A-Za-z']+$/.test(rmNw[0])) rmSay("one word, the title as the game shows it: ROOM NOVICE " + rmNv.toUpperCase() + " Ithin.", "orange");
    else {
      var rmT = rmNw[0].charAt(0).toUpperCase() + rmNw[0].slice(1);
      var rmAt = -1;
      for (var rmTi = 0; rmTi < R.newbieTitles.length; rmTi++) if (R.newbieTitles[rmTi].toLowerCase() === rmT.toLowerCase()) rmAt = rmTi;
      if (rmNv === "add" && rmAt >= 0) rmSay(rmT + " is already listed: " + rmTl() + ".");
      else if (rmNv === "remove" && rmAt < 0) rmSay(rmT + " isn't listed: " + rmTl() + ".", "orange");
      else {
        if (rmNv === "add") R.newbieTitles.push(rmT); else R.newbieTitles.splice(rmAt, 1);
        R.saveNovice();
        rmSay((rmNv === "add" ? "added " : "removed ") + rmT + ". Titles: " + rmTl() + ".", "lime");
      }
    }
  } else if (rmNv === "reset") {
    R.newbieTitles = R.newbieDefault.slice(0);
    R.saveNovice();
    rmSay("titles back to " + rmTl() + ".", "lime");
  } else {
    rmSay("ROOM NOVICE, ROOM NOVICE ADD|REMOVE <title>, ROOM NOVICE RESET.", "orange");
  }
} else if (rmSub === "probe") {
  var rmPv = rmW[1] || "";
  if (rmPv === "debug") {
    var rmPl = R.probeLast;
    if (!rmPl) rmSay("no probe has ended yet.");
    else {
      rmSay("last probe: " + rmPl.name + " (" + rmPl.id + "), ended by " + rmPl.how + " after " + rmPl.ms + " ms, " + rmPl.lines.length + " line" + (rmPl.lines.length === 1 ? "" : "s") + " hidden" + (rmPl.replayed ? ", " + rmPl.replayed + " not its answer shown again" : "") + ":");
      for (var rmPd = 0; rmPd < rmPl.lines.length; rmPd++) rmSay("  " + rmPl.lines[rmPd]);
      rmSay("round trip: fastest answer " + (R.rttMin ? R.rttMin + " ms; lines sooner than " + Math.round(R.rttMin * 0.8) + " ms after a probe aren't hidden." : "not timed yet."));
    }
  } else if (rmPv === "ignore" || rmPv === "unignore") {
    // Names the probe reads as owners that are places (Qurnok): not loyals.
    var rmNm = rmW.slice(2).join(" ").trim();
    if (!rmNm) {
      rmSay("not loyals, whoever they're loyal to: " + (R.loyalIgnore.length ? R.loyalIgnore.map(function (n) { return n.charAt(0).toUpperCase() + n.slice(1); }).join(", ") : "none") + ". ROOM PROBE IGNORE <name> to add one, UNIGNORE <name> to take it off.");
    } else {
      var rmNl = rmNm.toLowerCase(), rmNc = rmNl.charAt(0).toUpperCase() + rmNl.slice(1);
      var rmAt = R.loyalIgnore.indexOf(rmNl);
      if (rmPv === "ignore") {
        if (rmAt >= 0) rmSay("mobs loyal to " + rmNc + " are already not marked.");
        else {
          R.loyalIgnore.push(rmNl); R.saveLoyalIgnore();
          // Not remembered either.
          var rmDrop = 0;
          for (var rmLd in R.loyals) { if (R.loyals.hasOwnProperty(rmLd) && R.loyals[rmLd].o.toLowerCase() === rmNl) { delete R.loyals[rmLd]; rmDrop++; } }
          if (rmDrop) R.saveLoyals();
          rmSay("mobs loyal to " + rmNc + " are no longer marked as loyals.", "lime");
        }
      } else {
        if (rmAt < 0) rmSay(rmNc + " isn't on the list. ROOM PROBE IGNORE lists it.", "orange");
        else { R.loyalIgnore.splice(rmAt, 1); R.saveLoyalIgnore(); rmSay("mobs loyal to " + rmNc + " are marked as loyals again.", "lime"); }
      }
      if (client.loom.notify) client.loom.notify("room");
    }
  } else if (rmPv === "forget") {
    // The loyals remembered across sessions: recorded data, so CONFIRM.
    var rmLn = Object.keys(R.loyals).length;
    if (!rmLn) rmSay("no loyals remembered.");
    else if ((rmW[2] || "").toLowerCase() !== "confirm") rmSay("this forgets the " + rmLn + " loyal" + (rmLn === 1 ? "" : "s") + " remembered from earlier sessions; each is probed again when next seen. ROOM PROBE FORGET CONFIRM to go ahead.", "orange");
    else { R.loyals = {}; R.saveLoyals(); rmSay("forgot " + rmLn + " remembered loyal" + (rmLn === 1 ? "" : "s") + "; this session's stay marked.", "lime"); }
  } else if (rmPv === "on" || rmPv === "off") {
    R.probeOn = rmPv === "on";
    set_variable("room_probe", rmPv);
    if (!R.probeOn) R.probeQ = [];
    rmSay(R.probeOn ? "new mobs are probed (silently) for whose loyal they are." : "no more probing; loyals already found stay marked.", "lime");
    if (R.probeOn) { for (var rmPi in R.items) { if (R.items.hasOwnProperty(rmPi)) R.probeAdd(R.items[rmPi]); } R.probeHold = ""; R.probeNext(); }
  } else {
    var rmLy = [];
    for (var rmLi in R.loyal) { if (R.loyal.hasOwnProperty(rmLi) && R.ownerOf(rmLi)) rmLy.push(rmLi + " (" + R.ownerOf(rmLi) + ")"); }
    rmSay("probing is " + (R.probeOn ? "on" : "off") + "; " + Object.keys(R.loyal).length + " mobs known this session, " + Object.keys(R.loyals).length + " loyals remembered; this session's loyals: " + (rmLy.length ? rmLy.join(", ") : "none") + (R.probeQ.length ? "; " + R.probeQ.length + " waiting" + (R.probeBusy() ? " (the basher is fighting)" : (R.probeOthers().length ? " (after " + R.probeOthers().join(", ") + ")" : "")) : "") + ". ROOM PROBE ON|OFF to change it.");
  }
} else if (rmSub === "remember") {
  R.remember();
} else if (rmSub === "back") {
  R.goBack();
} else if (rmSub === "forget") {
  R.forget();
} else if (rmSub === "debug") {
  // The last payload of each GMCP message the tab reads, as JSON.
  var rmK = Object.keys(R.raw);
  if (!rmK.length) rmSay("no room GMCP seen yet.");
  for (var rmX = 0; rmX < rmK.length; rmX++) {
    var rmS = JSON.stringify(R.raw[rmK[rmX]]);
    rmSay(rmK[rmX] + " " + (rmS.length > 600 ? rmS.slice(0, 600) + "…" : rmS));
  }
  rmSay("me=" + (R.me || "?") + " players=" + Object.keys(R.players).length + " items=" + Object.keys(R.items).length);
} else {
  rmSay("unknown command '" + rmSub + "'. ROOM HELP for commands.", "orange");
}
run_function("room_render", [], "room");
