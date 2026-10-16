// self_setup -- run from onLoad and onInstall, on each Char.Status (the class
// may have changed), and by any reflex that finds the namespace missing.
// Namespace, registry, one-time migration of the old client.self* keys and
// my_name, then the live state, the watched defences for the current class
// and the afflictions kept on purpose, each built if missing.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.self) client.loom.self = {};
// redraw: how loom redraws the Self tab when a source changes (#176).
client.loom.registry.self = { version: "0.3.0", keyword: "SELF", desc: "{{description}}", redraw: function () { run_function("self_render", [], "self"); } };
var SF = client.loom.self;

// The old package kept its state in client.self, client.selfWant,
// client.selfWantCls, client.selfKeep and client.selfArgs. On a reimport
// without a page reload, the live state carries over.
if (client.self) {
  for (var sfK in client.self) {
    if (client.self.hasOwnProperty(sfK) && SF[sfK] === undefined) SF[sfK] = client.self[sfK];
  }
  delete client.self;
}
if (client.selfWant && !SF.want) { SF.want = client.selfWant; SF.wantCls = client.selfWantCls; }
if (client.selfKeep && !SF.keep) SF.keep = client.selfKeep;
var sfOld = ["selfWant", "selfWantCls", "selfKeep", "selfArgs"];
for (var sfI = 0; sfI < sfOld.length; sfI++) { if (client[sfOld[sfI]] !== undefined) delete client[sfOld[sfI]]; }

// One-time migration: my_name (set by the old SETNAME) -> self_name, the
// optional name override for the tab title. Nothing else in Loom reads it.
var sfMy;
try { sfMy = get_variable("my_name"); } catch (e) { sfMy = undefined; }
if (sfMy !== undefined && sfMy !== null) {
  var sfHave;
  try { sfHave = get_variable("self_name"); } catch (e) { sfHave = undefined; }
  if ((sfHave === undefined || sfHave === null || sfHave === "") && String(sfMy) !== "" && String(sfMy) !== "undefined") set_variable("self_name", String(sfMy));
  delete_variable("my_name");
}

// Live state, filled from GMCP and SCORE.
if (!SF.affs) SF.affs = {};
if (!SF.defs) SF.defs = {};
if (!SF.lost) SF.lost = {};
if (!SF.stats) SF.stats = [];
if (SF.statsKey === undefined) SF.statsKey = "";
if (!SF.info) SF.info = {};
if (!SF.score) SF.score = {};
if (SF.needDiag === undefined) SF.needDiag = false;
if (SF.seenAffs === undefined) SF.seenAffs = false;
if (SF.seenDefs === undefined) SF.seenDefs = false;

function sfList(name, def) {
  var raw;
  try { raw = get_variable(name); } catch (e) { raw = undefined; }
  var str = (raw === undefined || raw === null) ? def : String(raw);
  var out = {};
  var parts = str.split(",");
  for (var i = 0; i < parts.length; i++) { var n = parts[i].replace(/^\s+|\s+$/g, "").toLowerCase(); if (n) out[n] = true; }
  return out;
}
// Watched defences are kept per class (dragonform counts as its own class),
// in self_want_<class>. A class with no list yet starts from the old shared
// self_want list, so nothing set before per-class lists is lost.
var sfCls = String(SF.info["class"] || "any").toLowerCase().replace(/[^a-z0-9]+/g, "_");
if (!SF.want || SF.wantCls !== sfCls) {
  var sfRaw;
  try { sfRaw = get_variable("self_want_" + sfCls); } catch (e) { sfRaw = undefined; }
  SF.want = (sfRaw === undefined || sfRaw === null) ? sfList("self_want", "") : sfList("self_want_" + sfCls, "");
  SF.wantCls = sfCls;
}
if (!SF.keep) SF.keep = sfList("self_keep", "deafness,blindness,insomnia");

// The name in the tab title: self_name when set, otherwise the game's.
var sfName;
try { sfName = get_variable("self_name"); } catch (e) { sfName = undefined; }
SF.nameOverride = (sfName === undefined || sfName === null || String(sfName) === "undefined") ? "" : String(sfName);

// The read-only look other packages see through loom (#47).
//   look.explorer() -> { rank, base, dropped } once a real explorer rank is
//     known: rank now (GMCP first, then SCORE), base the one at this page
//     load (as the tab's arrow uses), dropped when rank is now worse (a
//     higher number). Undefined while unknown.
SF.look = {
  explorer: function () {
    var raws = [SF.info ? SF.info.explorerrank : undefined, SF.score ? SF.score.explorer : undefined], now = NaN;
    for (var i = 0; i < raws.length; i++) {
      var v = String(raws[i] === undefined || raws[i] === null ? "" : raws[i]);
      if (/^\s*\d+\s*$/.test(v) && parseInt(v, 10) > 0) { now = parseInt(v, 10); break; }
    }
    if (isNaN(now) || !(SF.explorerBase > 0)) return undefined;
    return { rank: now, base: SF.explorerBase, dropped: now > SF.explorerBase };
  }
};

// What DEFCON keeps up (#176, from defcon through loom's link defcon-self):
// { level, defs: { name: true } }, or null when the link is off, defcon
// isn't installed or no level is set. A separate layer from SELF WANT: it
// never writes self_want_<class>, and its losses show only in the tab.
SF.defconWant = function () {
  var LL = client.loom.loom;
  var w = (LL && LL.answer) ? LL.answer("self", "defences.wanted") : undefined;
  if (!w || !w.defs) return null;
  var set = {};
  for (var i = 0; i < w.defs.length; i++) set[w.defs[i]] = true;
  return { level: w.level, defs: set, n: w.defs.length };
};
