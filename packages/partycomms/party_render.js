// Rebuilds the Party tab. Throttled to once a second.
var now = Date.now() / 1000;
var lastr = get_variable("party_last_render") || 0;
if (now - lastr >= 1) {
  set_variable("party_last_render", now);
  var party = get_variable("party_data") || {};
  var mytid = get_variable("tar") || 0;
  var html = "<div style='font-family:sans-serif;font-size:12px;color:#dddddd;padding:4px'>";
  var count = 0;
  for (var nm in party) {
    var p = party[nm];
    var age = now - p.t;
    if (age <= 120) {
      count = count + 1;
      var dead = age > 12;
      html = html + "<div style='margin-bottom:10px;" + (dead ? "opacity:0.45;" : "") + "'>";
      html = html + "<div><b>" + nm + "</b>";
      if (dead) {
        html = html + " <span style='color:#cc6666;font-size:10px'>link lost " + Math.round(age) + "s</span>";
      }
      html = html + "</div>";
      var bars = [];
      bars.push([p.hp, p.maxhp, "#bb3838"]);
      bars.push([p.mp, p.maxmp, "#3a68b8"]);
      bars.push([p.ep, p.maxep, "#d742f5"]);
      bars.push([p.wp, p.maxwp, "#f5f242"]);
      for (var b = 0; b < bars.length; b++) {
        var cur = bars[b][0];
        var max = bars[b][1];
        var col = bars[b][2];
        var pct = 0;
        if (max > 0) { pct = Math.round(cur * 100 / max); }
        if (pct > 100) { pct = 100; }
        html = html + "<div style='background:#1c1c1c;height:13px;margin:2px 0;position:relative;border-radius:2px;overflow:hidden'>";
        html = html + "<div style='background:" + col + ";width:" + pct + "%;height:100%'></div>";
        html = html + "<span style='position:absolute;left:5px;top:0;font-size:10px;line-height:13px;color:#f0f0f0'>" + cur + " / " + max + "</span>";
        html = html + "</div>";
      }
      var nlp = p.nl;
      if (nlp > 100) { nlp = 100; }
      if (nlp < 0) { nlp = 0; }
      html = html + "<div style='background:#1c1c1c;height:5px;margin:4px 0 3px 0;border-radius:2px;overflow:hidden'>";
      html = html + "<div style='background:#7a5ab8;width:" + nlp + "%;height:100%'></div></div>";
      html = html + "<div style='font-size:11px;color:#aaaaaa'>Rage " + p.rage;
      html = html + " <span style='color:#888888'>&middot; NL " + p.nl + "%</span></div>";
      if (p.tid > 0) {
        var tcol = "#aaaaaa";
        if (mytid > 0 && p.tid == mytid) { tcol = "#7ac77a"; }
        var tlabel = p.tname;
        if (!tlabel || tlabel == "-") { tlabel = "#" + p.tid; }
        html = html + "<div style='font-size:11px;color:" + tcol + "'>&rarr; " + tlabel + "</div>";
      } else {
        html = html + "<div style='font-size:11px;color:#666666'>&rarr; no target</div>";
      }
      html = html + "</div>";
    }
  }
  if (count == 0) {
    html = html + "<div style='color:#888888'>No party data yet.</div>";
  }
  html = html + "</div>";
  set_custom_tab_html("Party", html);
}