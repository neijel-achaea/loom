var q = window.defcon_queue || [];
if (q.length === 0) {
    window.defcon_timer = null;
    display_notice("[defences] Defcon change complete.", "cyan");
} else {
    send_command(q.shift());
    window.defcon_queue = q;
    window.defcon_timer = setTimeout(function () {
        run_function("defcon_drain", {}, "defences");
    }, 250);
}