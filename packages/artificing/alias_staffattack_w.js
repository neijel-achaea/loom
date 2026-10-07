var staffAttack = args[1];

if (staffAttack == "fire") {
  set_variable("staffAttack", "scintilla");
  display_notice("[artificing] New staff attack: fire", "cyan")  
} else if (staffAttack == "frost") {
  set_variable("staffAttack", "horripilation");
  display_notice("[artificing] New staff attack: frost", "cyan")   
} else if (staffAttack == "lightning") {
  set_variable("staffAttack", "lightning");
  display_notice("[artificing] New staff attack: lightning", "cyan")   
} else {
  display_notice("[artificing] Wrong staff attack. Select fire, frost or lightning", "orange");
}