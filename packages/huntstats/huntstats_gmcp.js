// huntstats_gmcp -- the work behind onGMCP, as a function made once per load
// (client.loom.hooks.huntstats.gmcp). Nexus compiles a script afresh every time it
// runs, and long ones cost on every GMCP message, so the script itself stays two
// lines and calls this (#136). Run from onLoad and onInstall, so a reimport
// replaces it.
if (!client.loom) client.loom = {};
if (!client.loom.hooks) client.loom.hooks = {};
if (!client.loom.hooks.huntstats) client.loom.hooks.huntstats = {};
client.loom.hooks.huntstats.gmcp = function (args) {
  // Everything huntstats knows about where you are and how far along you are
  // comes from GMCP: Room.Info for the area, Char.Status and Char.Vitals for the
  // level and percent to next. Who hunted with you is the manual party list
  // (HUNTSTATS PARTY, #87) plus whoever follows you or you follow (#188), not
  // whoever was in the room.
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
          display_notice("[huntstats] filed interrupted hunt in " + hsB.area, "lime");
        }
      } else {
        try { set_variable("huntstats_open", ""); } catch (e) {}
      }
    }
  }

  // Your name, for the split's party tell report (#89). The game sends it only
  // at login, so it's kept (huntstats_name) for a package loaded mid-session.
  if ((hsM === "Char.Name" || hsM === "Char.Status") && hsA && hsA.name && String(hsA.name) !== HS.me) {
    HS.me = String(hsA.name);
    try { set_variable("huntstats_name", HS.me); } catch (e) {}
  }

  if (hsM === "Char.Status" && hsA && hsA.level !== undefined) {
    var hsS = String(hsA.level).match(/(\d+)(?:\s*\(([\d.]+)%\))?/);
    if (hsS) {
      HS.level = parseInt(hsS[1], 10);
      if (hsS[2] !== undefined) HS.nl = parseFloat(hsS[2]);
    }
  }

  if (hsM === "Char.Vitals" && hsA) {
    // Max health, for HUNTSTATS TANK's colours (#59).
    var hsMx = parseInt(hsA.maxhp, 10);
    if (!isNaN(hsMx) && hsMx > 0) HS.maxhp = hsMx;
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
  }

  if (hsM === "Room.Info" && hsA && hsA.area) {
    // A new room (not the same one sent again): following ends if you walked
    // off on your own (#188).
    if (hsA.num !== undefined && String(hsA.num) !== HS.followRoom) {
      HS.followRoom = String(hsA.num);
      if (HS.followMoved) HS.followMoved();
    }
    if (!HS.cur || HS.cur.area === undefined) {
      HS.fresh();
      HS.cur.area = hsA.area;
    } else if (hsA.area !== HS.cur.area) {
      run_function("huntstats_finalize", [], "huntstats");
      HS.cur.area = hsA.area;
    }
  }
};
