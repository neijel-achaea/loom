window.nj = window.nj || {};
if (!window.nj.ar || window.nj.ar.state !== "touch") { }
else {
  window.nj.ar.facets = parseInt(args[1], 10);
  clearTimeout(window.nj.ar.watchdog);
  window.nj.ar.plan();
}