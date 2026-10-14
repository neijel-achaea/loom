// loom_updates -- compares the packages loaded here with the versions on
// main (dist/versions.json, written by tools/versions.py on every push).
// LOOM UPDATES runs it with loom_updates_mode "manual": it always reports,
// including packages you don't have and when everything is current. The
// first class message of a session runs it with "auto": silent unless
// something here is out of date, and silent if the fetch fails.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.loom) client.loom.loom = {};
var luL = client.loom.loom;
var luManual = get_variable("loom_updates_mode") !== "auto";
var luURL = "https://raw.githubusercontent.com/neijel-achaea/loom/main/dist/versions.json";

// "0.4.31" < "0.4.33": compares each number in turn.
luL.newer = (a, b) => {
  var x = String(a || "0").split("."), y = String(b || "0").split(".");
  for (var i = 0; i < Math.max(x.length, y.length); i++) {
    var p = Number(x[i] || 0), q = Number(y[i] || 0);
    if (p != q) return p > q;
  }
  return false;
};

luL.report = (data, manual) => {
  var latest = (data && data.packages) || {};
  var reg = client.loom.registry;
  var old = [], ahead = [], missing = [];
  Object.keys(latest).sort().forEach((n) => {
    var have = reg[n] && reg[n].version;
    if (!have) missing.push(n);
    else if (luL.newer(latest[n], have)) old.push(n + " " + have + " → " + latest[n]);
    else if (luL.newer(have, latest[n])) ahead.push(n + " " + have);
  });
  if (old.length) {
    display_notice("[loom] " + old.length + " package" + (old.length == 1 ? "" : "s") + " out of date: " + old.join(", ") + ". Reimport from github.com/neijel-achaea/loom (dist/).", "orange");
  } else if (manual) {
    display_notice("[loom] every package here is up to date.", "lime");
  }
  if (manual && ahead.length) display_notice("[loom] newer than main (a branch build): " + ahead.join(", ") + ".", "cyan");
  if (manual && missing.length) display_notice("[loom] not installed here: " + missing.join(", ") + ".", "cyan");
};

if (luManual) display_notice("[loom] checking package versions...", "cyan");
fetch(luURL, { cache: "no-store" })
  .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
  .then((data) => luL.report(data, luManual))
  .catch((e) => { if (luManual || get_variable("debug") == "on") display_notice("[loom] couldn't check versions: " + e.message, "orange"); });
