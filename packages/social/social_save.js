// social_save -- writes the lists and the non-default colours.
var S = client.loom.social;
var soOut = {};
for (var soI = 0; soI < S.groups.length; soI++) soOut[S.groups[soI]] = Object.keys(S.lists[S.groups[soI]]).sort().join(",");
set_variable("social_lists", soOut);
var soCol = {};
for (var soC in S.color) { if (S.color[soC] != S.defColor[soC]) soCol[soC] = S.color[soC]; }
set_variable("social_colors", soCol);
var soW = [];
for (var soJ = 0; soJ < S.groups.length; soJ++) { if (S.watch[S.groups[soJ]]) soW.push(S.groups[soJ]); }
set_variable("social_watch", soW.join(","));
