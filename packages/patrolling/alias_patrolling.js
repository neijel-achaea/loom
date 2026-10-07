//Enter the script herevar p = client.patrol; if (!p) { client.patrol = {}; p = client.patrol; }
if (!client.patrol) client.patrol = { on:false, flagGaia:false, active:false, phase:null, env:"", present:[], shrines:[], expected:{} };
if ((args[1]||"").toLowerCase()=="on")   { client.patrol.on=true;  display_notice("[patrolling] Patrol: ON", "cyan");
run_function("patrol_check", null, "patrolling"); }
if ((args[1]||"").toLowerCase()=="off")  { client.patrol.on=false; client.patrol.active=false; client.patrol.phase=null; display_notice("[patrolling] Patrol: OFF", "cyan"); }
if ((args[1]||"").toLowerCase()=="here")  { run_function("patrol_check", [], "patrolling"); }
if ((args[1]||"").toLowerCase()=="learn") { client.patrol.learn=true; run_function("patrol_check", null, "patrolling"); }