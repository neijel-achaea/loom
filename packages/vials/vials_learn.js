// vials_learn -- end of an ELIXLIST capture (VIALS LEARN, #106): the vials
// found replace the stored map. Fluid to elixir: "an elixir of X" and "a salve
// of X" give X; "an X salve" gives X (epidermal, caloric). Empty vials (no
// sips, or "empty") are skipped; a fluid of no known shape is reported. Two
// vials of one elixir: the one with more sips is kept. Sips and months are
// kept too (vials_info), for VIALS to show.
var VI = client.loom.vials;
var L = VI.learn;
VI.learn = null;
clearTimeout(VI.learnT);
function lnSay(t, c) { display_notice("[vials] " + t, c || "cyan"); }
function lnElixir(fl) {
  var f = String(fl).toLowerCase().trim();
  var m = f.match(/^(?:an?\s+)?(?:elixir|salve|tonic|tincture|poultice)\s+of\s+([a-z]+)$/);
  if (m) return m[1];
  m = f.match(/^(?:an?\s+)?([a-z]+)\s+(?:salve|elixir|tonic|tincture|poultice)$/);
  if (m) return m[1];
  return null;
}
if (L) {
  var lnNew = {}, lnInfo = {}, lnSpare = [], lnOdd = [], lnEmpty = 0;
  for (var lnI = 0; lnI < L.rows.length; lnI++) {
    var r = L.rows[lnI];
    if (!r.sips || /\bempty\b/i.test(r.fluid)) { lnEmpty++; continue; }
    var el = lnElixir(r.fluid);
    if (!el) { lnOdd.push("vial" + r.vial + " (" + r.fluid + ")"); continue; }
    if (lnInfo[el]) {
      // Keep the vial with more sips; mention the other.
      if (r.sips > lnInfo[el].sips) { lnSpare.push(el + " in vial" + lnNew[el] + " (" + lnInfo[el].sips + " sips)"); lnNew[el] = r.vial; lnInfo[el] = { sips: r.sips, months: r.months }; }
      else lnSpare.push(el + " in vial" + r.vial + " (" + r.sips + " sips)");
      continue;
    }
    lnNew[el] = r.vial;
    lnInfo[el] = { sips: r.sips, months: r.months };
  }
  var lnSet = [], lnChanged = [], lnGone = [];
  for (var k in lnNew) {
    if (!lnNew.hasOwnProperty(k)) continue;
    if (!VI.map[k]) lnSet.push(k);
    else if (VI.map[k] !== lnNew[k]) lnChanged.push(k + " vial" + VI.map[k] + " -> vial" + lnNew[k]);
  }
  for (var g in VI.map) { if (VI.map.hasOwnProperty(g) && !lnNew[g]) lnGone.push(g + " (vial" + VI.map[g] + ")"); }
  var lnCount = Object.keys(lnNew).length;
  if (!L.rows.length) {
    lnSay("ELIXLIST showed no vials; nothing changed.", "orange");
  } else {
    VI.map = lnNew;
    VI.info = lnInfo;
    set_variable("vials_map", JSON.stringify(VI.map));
    set_variable("vials_info", JSON.stringify(VI.info));
    lnSay("learned " + lnCount + " vial" + (lnCount === 1 ? "" : "s") + " from ELIXLIST" + (lnSet.length || lnChanged.length || lnGone.length ? "." : ", same as before."), "lime");
    if (lnSet.length) lnSay("new: " + lnSet.sort().join(", ") + ".", "lime");
    if (lnChanged.length) lnSay("moved: " + lnChanged.sort().join(", ") + ".", "lime");
    if (lnGone.length) lnSay("no longer found, forgotten: " + lnGone.sort().join(", ") + ".", "orange");
    if (lnSpare.length) lnSay("a second vial, not used for refills: " + lnSpare.join(", ") + ".", "cyan");
    if (lnEmpty) lnSay(lnEmpty + " empty vial" + (lnEmpty === 1 ? "" : "s") + " skipped.", "cyan");
    if (lnOdd.length) lnSay("fluid not recognised, skipped: " + lnOdd.join(", ") + ". VIALS SET can add it by hand.", "orange");
    lnSay("VIALS lists them.", "cyan");
  }
}
