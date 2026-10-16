// Always loads OFF. Hunting may load after this package, so its absence is
// told a little later, once.
run_function("basher_setup", [], "basher");
setTimeout(function () {
  var B = client.loom && client.loom.basher;
  if (B && !B.hunting()) display_notice("[basher] needs the hunting package to attack; it sends nothing without it.", "orange");
}, 5000);
