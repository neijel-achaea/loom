gag_current_line();

var c = to_number(get_variable("clot_count")) || 0;
set_variable("clot_count", c + 1);

if (window.clotTimer) clearTimeout(window.clotTimer);
window.clotTimer = setTimeout(function () {
    var n = to_number(get_variable("clot_count")) || 0;
    if (n > 0) {
        var line = "You exert superior mental control and your wounds clot before your eyes.";
        if (n > 1) line += " (x" + n + ")";
        display_notice(line);
    }
    delete_variable("clot_count");
    window.clotTimer = null;
}, 400);