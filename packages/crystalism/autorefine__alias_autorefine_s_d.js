window.nj = window.nj || {};

window.nj.ar = {
  state: "ir",
  rift: {},
  facets: 0,
  hardCap: 200,
  askCap: args[1] ? parseInt(args[1], 10) : Infinity,
  queue: [],
  settle: null,
  watchdog: null,
  shapes: ["cube", "cylinder", "diamond", "disc", "egg", "pentagon",
           "polyhedron", "pyramid", "sphere", "spiral", "torus"],
  maxPerCommand: 10,
  facetsPerCrystal: 1
};

window.nj.ar.abort = function (why) {
  display_notice("[crystalism] Autorefine aborted: " + why);
  window.nj.ar.state = "idle";
  window.nj.ar.queue = [];
};

window.nj.ar.pump = function () {
  var ar = window.nj.ar;
  if (ar.state !== "refining") { return; }
  if (!ar.queue.length) {
    ar.state = "finishing";
    send_command("inr all");
    display_notice("[crystalism] Autorefine: done.");
    ar.state = "idle";
    return;
  }
  send_command(ar.queue.shift());
  setTimeout(window.nj.ar.pump, 1500);
};

window.nj.ar.plan = function () {
  var ar = window.nj.ar;
  var counts = {};
  var add = {};
  var budget, i, best, bestVal, order, parts;

  ar.shapes.forEach(function (s) {
    counts[s] = ar.rift[s] || 0;
    add[s] = 0;
  });

  budget = Math.min(
    Math.floor(ar.facets / ar.facetsPerCrystal),
    ar.hardCap,
    ar.askCap
  );

  if (budget < 1) {
    display_notice("[crystalism] Autorefine: nothing to do (" + ar.facets + " facets stored).");
    ar.state = "idle";
    return;
  }

  for (i = 0; i < budget; i++) {
    best = null;
    bestVal = Infinity;
    ar.shapes.forEach(function (s) {
      if (counts[s] + add[s] < bestVal) {
        bestVal = counts[s] + add[s];
        best = s;
      }
    });
    add[best] += 1;
  }

  order = ar.shapes.slice().sort(function (a, b) {
    return counts[a] - counts[b];
  });

  ar.queue = [];
  parts = [];
  order.forEach(function (s) {
    var n = add[s];
    if (n > 0) { parts.push(s + " +" + n); }
    while (n > 0) {
      ar.queue.push("refine " + Math.min(n, ar.maxPerCommand) + " " + s);
      n -= Math.min(n, ar.maxPerCommand);
    }
  });

  display_notice("[crystalism] Autorefine: " + budget + " crystals in "
                 + ar.queue.length + " commands (" + parts.join(", ") + ")");

  ar.state = "refining";
  window.nj.ar.pump();
};

window.nj.ar.watchdog = setTimeout(function () {
  if (window.nj.ar.state === "ir" || window.nj.ar.state === "touch") {
    window.nj.ar.abort("no response at state '" + window.nj.ar.state + "'");
  }
}, 8000);

send_command("ir crystal");