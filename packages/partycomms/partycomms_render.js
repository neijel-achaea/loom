// partycomms_render -- draws the 'Party' tab in the house style shared with
// Coffers, Level, Ledger and the rest: ink panel, serif small-caps heading,
// monospace figures. Each party member is a chip: name and class, four slim
// vitals bars, rage, and their target (green when it is yours too). Redrawn
// at most once a second; a report older than 12 seconds fades as a lost
// link, and one older than two minutes is dropped.
var PC = client.loom.partycomms;
var now = Date.now() / 1000;
if (now - PC.lastRender >= 1) {
  PC.lastRender = now;
  var SEA = "#7cc4b0";
  var DEEP = "#3f6b60";
  var TXT = "#dfe8e5";
  var MUTED = "#82918d";
  var RULE = "#1f2b2a";
  var TRACK = "#1c2423";
  var CHIP = "#111817";
  var WARN = "#e6c25a";
  var OK = "#8fd0a0";
  var LOW = "#e0605a";
  var VITALS = [["hp", "health", "#d06a5e"], ["mp", "mana", "#6a96d6"], ["ep", "endurance", "#d2a64e"], ["wp", "willpower", "#a58ad8"]];
  var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
  var MONO = "Consolas,'DejaVu Sans Mono',monospace";

  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function pct(c, m) { if (!(m > 0)) return 0; var p = Math.round(c * 100 / m); return p < 0 ? 0 : (p > 100 ? 100 : p); }
  function thou(n) { var s = String(Math.round(n || 0)); var o = ""; while (s.length > 3) { o = "," + s.slice(-3) + o; s = s.slice(0, -3); } return s + o; }
  // One vitals row: a letter, the bar, the percentage; the figures on hover.
  function bar(label, title, col, c, m) {
    var p = pct(c, m);
    return '<div style="display:flex;align-items:center;gap:4px;margin:1px 0;" title="' + esc(title + ": " + thou(c) + " / " + thou(m)) + '">' +
      '<span style="color:' + MUTED + ';width:1.4em;">' + label + '</span>' +
      '<div style="flex:1 1 auto;background:' + TRACK + ';height:6px;"><div style="background:' + col + ';height:6px;width:' + p + '%;"></div></div>' +
      '<span style="min-width:2.6em;text-align:right;color:' + (label === "hp" && p < 30 ? LOW : TXT) + ';">' + p + '%</span></div>';
  }

  // Members heard from, freshest reports only; you first, then by name.
  var names = [];
  for (var nm in PC.members) {
    if (PC.members.hasOwnProperty(nm)) {
      if (now - PC.members[nm].t > 120) delete PC.members[nm];
      else names.push(nm);
    }
  }
  var me = PC.me.name;
  function byMember(a, b) { if (a === me) return -1; if (b === me) return 1; return a < b ? -1 : (a > b ? 1 : 0); }
  names.sort(byMember);

  // Three figures side by side, the party tab's counterpart of the coin stack.
  var glyph = '<svg width="18" height="15" viewBox="0 0 18 15" style="vertical-align:-3px;margin-right:6px;" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="4" cy="5" r="2.2" fill="' + DEEP + '"/><path d="M0.5 14 C1 10 2.5 8.8 4 8.8 C5.5 8.8 7 10 7.5 14 Z" fill="' + DEEP + '"/>' +
    '<circle cx="14" cy="5" r="2.2" fill="' + DEEP + '"/><path d="M10.5 14 C11 10 12.5 8.8 14 8.8 C15.5 8.8 17 10 17.5 14 Z" fill="' + DEEP + '"/>' +
    '<circle cx="9" cy="3.6" r="2.6" fill="' + SEA + '"/><path d="M4.8 14 C5.3 9.4 7.2 7.9 9 7.9 C10.8 7.9 12.7 9.4 13.2 14 Z" fill="' + SEA + '"/></svg>';

  var html = '<div style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:#0d1211;border:1px solid ' + RULE + ';padding:7px 8px 8px;">';
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
  html += '<div style="font-family:' + SERIF + ';color:' + SEA + ';font-size:14px;letter-spacing:0.22em;">' + glyph + 'PARTY</div>';
  var right = names.length + ' member' + (names.length === 1 ? '' : 's');
  right += ' &middot; ' + (PC.on ? (me ? 'sharing as ' + esc(me) : 'sharing') : '<span style="color:' + WARN + ';">not sharing</span>');
  html += '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;color:' + MUTED + ';font-size:11px;">' + right + '</div></div>';

  if (names.length === 0) {
    html += '<div style="margin-top:8px;color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">No reports yet. In a party with partycomms on, members appear here as their reports arrive. PARTYCOMMS TEST shows two sample chips.</div>';
  } else {
    var myT = (PC.target && PC.target.id) ? PC.target.id : "";
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">';
    for (var i = 0; i < names.length; i++) {
      var p = PC.members[names[i]];
      var age = now - p.t;
      var lost = age > 12;
      var hpP = pct(p.hp, p.maxhp);
      var top = (hpP < 30) ? LOW : (names[i] === me ? SEA : DEEP);
      var c = '<div style="flex:1 1 150px;min-width:150px;max-width:280px;background:' + CHIP + ';border:1px solid ' + RULE + ';border-top:2px solid ' + top + ';padding:3px 5px 4px;' + (lost ? 'opacity:0.45;' : '') + '">';
      c += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:6px;margin-bottom:2px;">';
      c += '<span style="font-family:' + SERIF + ';font-size:12px;color:' + (names[i] === me ? SEA : TXT) + ';white-space:nowrap;">' + esc(names[i]) + '</span>';
      c += '<span style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.08em;color:' + MUTED + ';font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (lost ? '<span style="color:' + LOW + ';">link lost ' + Math.round(age) + 's</span>' : esc(p.cls || "")) + '</span></div>';
      for (var v = 0; v < VITALS.length; v++) {
        var k = VITALS[v][0];
        if (p["max" + k] > 0) c += bar(k, VITALS[v][1], VITALS[v][2], p[k], p["max" + k]);
      }
      var rg = p.rage || 0;
      var rcol = rg >= 36 ? OK : (rg >= 14 ? WARN : MUTED);
      c += '<div style="display:flex;justify-content:space-between;gap:6px;margin-top:2px;border-top:1px dotted ' + RULE + ';padding-top:2px;">';
      c += '<span style="color:' + MUTED + ';">rage <span style="color:' + rcol + ';">' + rg + '</span></span>';
      if (p.tid || p.tname) {
        var same = myT && p.tid && p.tid === myT;
        var tl = p.tname || ("#" + p.tid);
        c += '<span style="color:' + (same ? OK : TXT) + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70%;" title="' + esc(tl + (p.tid ? " #" + p.tid : "") + (same ? ", your target too" : "")) + '">&rarr; ' + esc(tl) + (p.thp !== "" && p.thp !== undefined ? ' <span style="color:' + MUTED + ';">' + esc(p.thp) + '%</span>' : '') + '</span>';
      } else {
        c += '<span style="color:' + MUTED + ';font-style:italic;font-family:' + SERIF + ';">no target</span>';
      }
      c += '</div></div>';
      html += c;
    }
    html += '</div>';
  }
  html += '</div>';
  try { set_custom_tab_html("Party", html); } catch (e) {}
}
