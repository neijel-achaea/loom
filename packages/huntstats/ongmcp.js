// Everything huntstats knows about where you are and how far along you are
// comes from GMCP: Room.Info for the area, Room.Players for who hunted with
// you, Char.Status and Char.Vitals for the level and percent to next.
var hsM = "";
var hsA = null;
try { hsM = args.gmcp_method; hsA = args.gmcp_args; } catch (e) { hsM = ""; }
if (typeof hsA === "string") { try { hsA = JSON.parse(hsA); } catch (e) { hsA = null; } }
if (!client.loom || !client.loom.huntstats || !client.loom.huntstats.xpTable) run_function("huntstats_setup", [], "huntstats");
var HS = client.loom.huntstats;

// --- resume or bank an interrupted hunt (once per connection) ---
// client.* is wiped on a refresh or reconnect, so HS.resumed is unset again
// and the huntstats_open checkpoint (a saved variable) is recovered here.
if (!HS.resumed) {
  HS.resumed = true;
  var hsSaved = "";
  try { hsSaved = get_variable("huntstats_open"); } catch (e) { hsSaved = ""; }
  if (hsSaved) {
    var hsB = null;
    try { hsB = JSON.parse(hsSaved); } catch (e) { hsB = null; }
    if (hsB && hsB.area !== undefined && hsB.firstXpAt && hsB.xp > 0) {
      var hsIdle = Date.now() - (hsB.lastXpAt || hsB.firstXpAt);
      HS.cur = hsB;
      if (hsIdle < 600000) {
        display_notice("[huntstats] resumed hunt in " + hsB.area + " (" + hsB.xp.toLocaleString() + " xp so far)", "cyan");
      } else {
        run_function("huntstats_finalize", [], "huntstats");
        display_notice("[huntstats] filed interrupted hunt in " + hsB.area, "cyan");
      }
    } else {
      try { set_variable("huntstats_open", ""); } catch (e) {}
    }
  }
}

if (hsM === "Char.Status" && hsA && hsA.level !== undefined) {
  var hsS = String(hsA.level).match(/(\d+)(?:\s*\(([\d.]+)%\))?/);
  if (hsS) {
    HS.level = parseInt(hsS[1], 10);
    if (hsS[2] !== undefined) HS.nl = parseFloat(hsS[2]);
  }
}

if (hsM === "Char.Vitals" && hsA) {
  var hsP = null;
  if (hsA.charstats) {
    for (var hsI = 0; hsI < hsA.charstats.length; hsI++) {
      var hsC = String(hsA.charstats[hsI]).match(/Level:\s*(\d+)\s*\(([\d.]+)%\)/);
      if (hsC) { hsP = hsC; break; }
    }
  }
  if (hsP) {
    HS.level = parseInt(hsP[1], 10);
    HS.nl = parseFloat(hsP[2]);
  } else if (hsA.nl !== undefined) {
    // Whole percent only: keep a precise figure already held for it.
    var hsN = parseFloat(hsA.nl);
    if (!isNaN(hsN) && (HS.nl === undefined || Math.floor(HS.nl) !== hsN)) HS.nl = hsN;
  }

  // Dragonhood % on the chosen F-key. Set when it changes, and again every
  // half minute in case another package redrew the keys in between.
  if (HS.button > 0) {
    var hsD = HS.dragon();
    if (hsD !== null) {
      var hsLabel = "DH " + hsD.toFixed(2) + "%";
      var hsNow = Date.now();
      if (hsLabel !== HS.btnLabel || !HS.btnAt || hsNow - HS.btnAt > 30000) {
        HS.btnLabel = hsLabel;
        HS.btnAt = hsNow;
        try { buttons_set_label(HS.button, hsLabel); } catch (e) {}
      }
    }
  }
}

if (hsM === "Room.Info" && hsA && hsA.area) {
  if (!HS.cur || HS.cur.area === undefined) {
    HS.fresh();
    HS.cur.area = hsA.area;
  } else if (hsA.area !== HS.cur.area) {
    run_function("huntstats_finalize", [], "huntstats");
    HS.cur.area = hsA.area;
  }
}

if (hsM === "Room.Players" && hsA && hsA.length && HS.cur) {
  if (!HS.cur.players) HS.cur.players = {};
  for (var hsJ = 0; hsJ < hsA.length; hsJ++) {
    if (hsA[hsJ] && hsA[hsJ].name) HS.cur.players[hsA[hsJ].name] = 1;
  }
}
