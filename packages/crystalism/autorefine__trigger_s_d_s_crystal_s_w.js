window.nj = window.nj || {};
if (!window.nj.ar || window.nj.ar.state !== "ir") { }
else {
  var ar = window.nj.ar;
  var re = /\[\s*(\d+)\]\s*crystal\s+([a-z]+)/g;
  var m = re.exec(args[1]);

  while (m !== null) {
    if (ar.shapes.indexOf(m[2]) !== -1) {
      ar.rift[m[2]] = parseInt(m[1], 10);
    }
    m = re.exec(args[1]);
  }

  clearTimeout(ar.settle);
  ar.settle = setTimeout(function () {
    window.nj.ar.state = "touch";
    send_command("touch crystal");
  }, 400);
}