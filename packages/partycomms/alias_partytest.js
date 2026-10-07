// Injects two fake members so the tab can be checked solo.
var now = Date.now() / 1000;
var party = get_variable("party_data") || {};
var a = {};
a.hp = 3200; a.maxhp = 4784; a.mp = 4646; a.maxmp = 5096;
a.ep = 18000; a.maxep = 21685; a.wp = 18870; a.maxwp = 23170;
a.rage = 24; a.nl = 28.12; a.tid = 12345; a.tname = "a plague rat";
a.t = now;
var b = {};
b.hp = 900; b.maxhp = 4100; b.mp = 2000; b.maxmp = 4800;
b.ep = 9000; b.maxep = 20000; b.wp = 11000; b.maxwp = 21000;
b.rage = 41; b.nl = 92.4; b.tid = 0; b.tname = "-";
b.t = now - 30;
party["Testalpha"] = a;
party["Testbeta"] = b;
set_variable("party_data", party);
set_variable("party_last_render", 0);
run_function("party_render", [], "partycomms");
display_notice("[partycomms] test rows injected - check the Party tab", "cyan");