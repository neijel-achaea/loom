var activeClass = get_variable("activeClass");
var slots = get_variable("rage_slots") || {};
var costs = get_variable("rage_costs") || {};
var cd    = get_variable("rage_cd") || {};
var rage  = get_variable("my_rage") || 0;
var glob  = get_variable("rage_global");

for (var name in slots) {
  if (costs[name] === undefined) { continue; }
  var lit = glob && (cd[name] !== false) && rage >= costs[name];
  buttons_set_highlight(slots[name], lit ? 1 : 0);
}

// Highlight main attack
var mybal = get_variable("my_bal");
var myeq = get_variable("my_eq");

if (activeClass == "Black Dragon") {
  if (mybal == "1" && myeq == "1") {
    buttons_set_highlight(1, 1);
    buttons_set_highlight(4, 1);
    buttons_set_highlight(11, 1);
  } else {
    buttons_set_highlight(1, 0);
    buttons_set_highlight(4, 0);
    buttons_set_highlight(11, 0);
  } 
}

if (activeClass == "Blue Dragon") {
  if (mybal == "1" && myeq == "1") {
    buttons_set_highlight(1, 1);
    buttons_set_highlight(4, 1);
  } else {
    buttons_set_highlight(1, 0);
    buttons_set_highlight(4, 0);
  } 
}

if (activeClass == "Magi") {
  if (mybal == "1" && myeq == "1") {
    buttons_set_highlight(1, 1);
  } else {
    buttons_set_highlight(1, 0);
  } 
}

if (activeClass == "Sylvan") {
  if (mybal == "1" && myeq == "1") {
    buttons_set_highlight(1, 1);
  } else {
    buttons_set_highlight(1, 0);
  } 
}