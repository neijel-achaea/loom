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
    for (var soI = 0; soI < S.groups.length; soI++) {
      if (S.lists[S.groups[soI]][soName]) {
        colorize_current_line(soM.index, soM[0].length, S.color[S.groups[soI]], "");
        break;
      }
    }
  }
}
// The capture ends on QW's last line, "Plus another N ... (M total)." (#75),
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
