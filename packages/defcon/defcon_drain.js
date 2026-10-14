// defcon_drain -- sends the queued curing changes one every 250ms.
var D = client.loom.defcon;
if (D.queue.length === 0) {
  D.timer = null;
  display_notice("[defcon] change complete.", "lime");
} else {
  send_command(D.queue.shift());
  D.timer = setTimeout(function () {
    run_function("defcon_drain", [], "defcon");
  }, 250);
}
