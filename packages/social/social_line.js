// social_line -- the work behind the every-line trigger, as a function made once per load
// (client.loom.hooks.social.line). Nexus compiles a script afresh every time it
// runs, and long ones cost on every game line, so the script itself stays two
// lines and calls this (#136). Run from onLoad and onInstall, so a reimport
// replaces it.
if (!client.loom) client.loom = {};
if (!client.loom.hooks) client.loom.hooks = {};
if (!client.loom.hooks.social) client.loom.hooks.social = {};
client.loom.hooks.social.line = function (args) {
  // Every line: colour listed names (and your own), and collect QW output while
  // a poll is capturing.
  if (!client.loom || !client.loom.social || !client.loom.social.lists) run_function("social_setup", [], "social");
  var S = client.loom.social;
  var soLine = args[1];
  if (soLine) {
    var soRe = S.reWord;
    soRe.lastIndex = 0;
    var soM;
    while ((soM = soRe.exec(soLine)) !== null) {
      var soName = soM[0].toLowerCase();
      if (S.me && soName == S.me) {
        colorize_current_line(soM.index, soM[0].length, S.color.self, "");
        continue;
      }
      var soCol = S.nameColour(soName);
      if (soCol) colorize_current_line(soM.index, soM[0].length, soCol, "");
    }
  }
  // The capture ends on QW's last line, "Plus another N ... (M total)." or, with
  // nobody hidden, "(M total)." (#75),
  // not on a timer; only QW-shaped lines are gagged.
  if (S.capturing) {
    if (soLine === "qw") {
      gag_current_line();
    } else if (S.reFooter.test(soLine)) {
      S.buf.push(soLine);
      gag_current_line();
      run_function("social_flush", [], "social");
    } else if (S.reNames.test(soLine)) {
      S.buf.push(soLine);
      gag_current_line();
    }
  }
};
