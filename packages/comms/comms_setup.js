// comms_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry and state for the Comms tab
// (#157), a replacement for the stock communication window fed only by GMCP
// Comm.Channel.Text {channel, talker, text}:
//   C.chans   key -> {key, cap, lines, unread, first}; key is the GMCP channel
//             ("says", "party", "ct"...), except tells, all kept under "tells"
//   C.convs   tells by person: name -> {name, unread, last}
//   C.view    what the tab shows: "all", a channel key, "tells" (the
//             conversations) or "tell:<name>" (one conversation)
//   C.muted   key -> true; muted channels are kept but left out of All and
//             count no unread (comms_muted)
//   C.cap     lines kept per channel (comms_cap, default 300)
//   C.me      your name (Char.Name / Char.Status, kept as comms_name)
//   C.raw     the last payload of each method, for COMMS DEBUG
// A few of the latest lines are saved (comms_saved) so a reload starts with them.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.comms) client.loom.comms = {};
// redraw: how loom redraws the Comms tab when an integration's source changes (#159).
client.loom.registry.comms = { version: "0.2.5", keyword: "COMMS", desc: "{{description}}", redraw: function () { run_function("comms_render", [], "comms"); } };
var C = client.loom.comms;
C.tab = "Comms";
if (!C.chans) C.chans = {};
if (!C.convs) C.convs = {};
if (!C.raw) C.raw = {};
if (!C.captions) C.captions = {};   // from Comm.Channel.List: "the Clan of Bartho Designs"
if (!C.short) C.short = {};         // from the lines' own prefix: "Bartho Designs"
if (!C.view) C.view = "all";
if (!C.seq) C.seq = 0;
if (!C.me) { try { C.me = String(get_variable("comms_name") || ""); } catch (e) { C.me = ""; } }
var csCap = parseInt(get_variable("comms_cap"), 10);
C.cap = (csCap >= 50 && csCap <= 2000) ? csCap : 300;
C.muted = {};
var csMu = get_variable("comms_muted");
if (csMu) {
  var csMl = String(csMu).split(",");
  for (var csI = 0; csI < csMl.length; csI++) { if (csMl[csI]) C.muted[csMl[csI]] = true; }
}

// A channel's name for the tab and notices: the lines' own prefix ("Bartho
// Designs") first, then Comm.Channel.List's caption without "the" / "the Clan
// of", then the key itself.
C.name = function (k) {
  var cc = client.loom.comms;
  k = String(k || "");
  if (k === "tells") return "Tells";
  if (k === "says") return "Say";
  if (cc.short[k]) return cc.short[k];
  if (cc.captions[k]) return cc.captions[k].replace(/^the\s+(?:clan\s+of\s+)?/i, "");
  return k.charAt(0).toUpperCase() + k.slice(1);
};

// Clan channels, shown together under one Clans filter (Ricardo,
// 2026-10-19): Comm.Channel.List captions them "the Clan of <name>"; a
// clt<N> key counts too, for a clan heard before the list came.
C.isClan = function (k) {
  var cc = client.loom.comms;
  k = String(k || "");
  return /^clt\d+$/i.test(k) || /^the\s+clan\s+of\b/i.test(String(cc.captions[k] || ""));
};

// A channel's names to match on: its key, Comm.Channel.List's caption and the
// lines' own prefix, lowercased.
C.names = function (k) {
  var cc = client.loom.comms;
  k = String(k || "");
  return [k, String(cc.captions[k] || "").replace(/^the\s+/i, ""), String(cc.short[k] || "")].join("|").toLowerCase();
};
// Channels left out altogether (#334, Ricardo): Emotes and Deathsight carry
// the gods' roleplay, not talk. Never stored, no filter; the main window
// still shows them.
C.dropped = function (k) {
  return /(?:^|\|)(?:emotes?|deathsight)(?:\||$)/.test(C.names(k));
};
// The filters' order (#334, Ricardo): Say, Tell, Party, Yell, Shout, City,
// House, HNT, Clans, then everything else alphabetically.
C.order = [
  /(?:^|\|)says?(?:\||$)/,
  /(?:^|\|)tells(?:\||$)/,
  /(?:^|\|)(?:party|pt)(?:\||$)/,
  /(?:^|\|)yells?(?:\||$)/,
  /(?:^|\|)shouts?(?:\||$)/,
  /(?:^|\|)(?:ct|city)(?:\||$)/,
  /(?:^|\|)(?:ht|gt|house)(?:\||$)/,
  /(?:^|\|)(?:hnt|gnt|house newbie[^|]*)(?:\||$)/
];
C.rank = function (k) {
  if (C.isClan(k)) return C.order.length;
  var n = C.names(k);
  for (var i = 0; i < C.order.length; i++) { if (C.order[i].test(n)) return i; }
  return C.order.length + 1;
};

// The latest lines from before the reload, when nothing has come in yet.
if (!C.restored) {
  C.restored = true;
  var csSv = get_variable("comms_saved");
  if (typeof csSv === "string") { try { csSv = JSON.parse(csSv); } catch (e) { csSv = null; } }
  if (csSv && csSv.lines && csSv.lines.length) {
    if (csSv.short) { for (var csK in csSv.short) { if (csSv.short.hasOwnProperty(csK) && !C.short[csK]) C.short[csK] = csSv.short[csK]; } }
    for (var csJ = 0; csJ < csSv.lines.length; csJ++) {
      var csL = csSv.lines[csJ];
      if (!csL || !csL.ch || C.dropped(csL.ch)) continue;
      if (!C.chans[csL.ch]) C.chans[csL.ch] = { key: csL.ch, lines: [], unread: 0, first: ++C.seq };
      csL.s = ++C.seq;
      csL.old = true;
      C.chans[csL.ch].lines.push(csL);
      if (csL.conv) {
        var csCk = csL.conv.toLowerCase();
        if (!C.convs[csCk]) C.convs[csCk] = { name: csL.conv, unread: 0, last: 0 };
        C.convs[csCk].last = Math.max(C.convs[csCk].last, csL.t || 0);
      }
    }
  }
}

// What the tab's clicks call: the tab's page can't reach client, but it shares
// this window, so these closures do the work on its behalf.
try {
  window.loomComms = {
    view: function (k) { run_function("comms_view", { key: String(k) }, "comms"); },
    chip: function (i) {
      var cc = client.loom.comms;
      if (cc.chips && cc.chips[i] !== undefined) run_function("comms_view", { key: cc.chips[i] }, "comms");
    },
    mute: function () {
      var cc = client.loom.comms;
      if (cc.view && cc.chans[cc.view]) run_function("comms_mute", { key: cc.view, on: !cc.muted[cc.view] }, "comms");
    },
    tell: function (name) {
      // Put "t <name> " in the input line (Ricardo prefers the short form). Nexus's input is a React field, so
      // the value goes in through the native setter and an input event.
      var n = String(name).replace(/[^A-Za-z]/g, "");
      if (!n) return;
      var inp = window.loomComms.input();
      if (!inp) { display_notice("[comms] couldn't find the input line to put the tell in. COMMS DEBUG shows what was looked for.", "orange"); return; }
      var v = "t " + n + " ";
      try {
        var proto = Object.getPrototypeOf(inp);
        var desc = Object.getOwnPropertyDescriptor(proto, "value");
        if (desc && desc.set) desc.set.call(inp, v); else inp.value = v;
      } catch (e) { inp.value = v; }
      try { inp.dispatchEvent(new Event("input", { bubbles: true })); } catch (e) {}
      try { inp.focus(); inp.setSelectionRange(v.length, v.length); } catch (e) {}
    },
    input: function () {
      var ids = ["userinput", "user_input", "input", "command_input"];
      for (var i = 0; i < ids.length; i++) {
        var e = document.getElementById(ids[i]);
        if (e && (e.tagName === "TEXTAREA" || e.tagName === "INPUT")) return e;
      }
      // Otherwise the text field last typed into (the input line, almost
      // always), or the first visible textarea, then the first text input.
      var li = window.loomCommsLastInput;
      if (li && li.isConnected && li.offsetParent !== null) return li;
      var sels = ["textarea", "input[type=text], input:not([type])"];
      for (var s = 0; s < sels.length; s++) {
        var all = document.querySelectorAll(sels[s]);
        for (var j = 0; j < all.length; j++) { if (all[j].offsetParent !== null) return all[j]; }
      }
      return null;
    }
  };
  if (!window.loomCommsFocus) {
    window.loomCommsFocus = true;
    document.addEventListener("focusin", function (ev) {
      var t = ev.target;
      if (t && (t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && (!t.type || t.type === "text")))) window.loomCommsLastInput = t;
    }, true);
  }
} catch (e) {}
