if (!client.tal) {
  var pieces = {};
  try { pieces = JSON.parse(get_variable("tal_pieces")) || {}; } catch (e) { pieces = {}; }
  client.tal = {
    pieces: pieces,
    reqCommon: 64,
    reqRare: 4,
    colors: ["black", "blue", "gold", "green", "red", "silver"],
    commonTypes: ["bone", "claw", "eye", "heart", "leather", "scale", "tooth"],
    colorrare: { black: "sac", blue: "lung", gold: "stem", green: "sac", red: "belly", silver: "larynx" },
    exceptions: { "brain stem": "stem", "acid sac": "sac", "poison sac": "sac" },
    real: function (type) { return this.exceptions[type] || type; },
    getcount: function (color, type) {
      var rt = this.real(type);
      var c = this.pieces[color];
      if (!c || !c[rt]) { return 0; }
      var total = 0, lv = c[rt];
      for (var k in lv) {
        if (lv.hasOwnProperty(k)) {
          var y = Number(lv[k]) || 0;
          if (y > 0) { total += Math.pow(2, Number(k) - 1) * y; }
        }
      }
      return total;
    },
    add: function (color, type, level, count) {
      color = String(color).toLowerCase();
      var rt = this.real(String(type).toLowerCase());
      if (!this.pieces[color]) { this.pieces[color] = {}; }
      if (!this.pieces[color][rt]) { this.pieces[color][rt] = {}; }
      var key = String(level);
      this.pieces[color][rt][key] = (Number(this.pieces[color][rt][key]) || 0) + (Number(count) || 0);
    },
    remove: function (color, type, level, count) {
      color = String(color).toLowerCase();
      var rt = this.real(String(type).toLowerCase());
      if (!this.pieces[color] || !this.pieces[color][rt]) { return; }
      var key = String(level);
      var n = (Number(this.pieces[color][rt][key]) || 0) - (Number(count) || 0);
      this.pieces[color][rt][key] = n > 0 ? n : 0;
    },
    reset: function () { this.pieces = {}; }
  };
}

// --- history store -------------------------------------------------------
// Each entry is a compact array [unixSeconds, cappedCommonOwned, cappedRareOwned].
// Capped means counted toward the goal, so 100 black claws still scores 64.
if (!client.talHist) {
  var h = [];
  try { h = JSON.parse(get_variable("tal_hist")) || []; } catch (e) { h = []; }
  if (Object.prototype.toString.call(h) !== "[object Array]") { h = []; }
  client.talHist = h;
}
if (client.talGraphOn === undefined) {
  var g = "1";
  try { if (get_variable("tal_graph_on") !== undefined) { g = String(get_variable("tal_graph_on")); } } catch (e) { g = "1"; }
  client.talGraphOn = (g !== "0");
}
// Goal: 6 colours x 7 common types x 64, plus 6 x 4 rare.
client.talGoalCommon = 2688;
client.talGoalRare = 24;
client.talGoalTotal = 2712;
client.talBucket = 3600;
if (client.talChartH === undefined) {
  var ch = 110;
  try { if (get_variable("tal_graph_h") !== undefined) { ch = parseInt(get_variable("tal_graph_h"), 10); } } catch (e) { ch = 110; }
  if (!ch || isNaN(ch) || ch < 40) { ch = 110; }
  if (ch > 400) { ch = 400; }
  client.talChartH = ch;
}
client.talHistSoft = 700;
client.talHistCap = 1500;