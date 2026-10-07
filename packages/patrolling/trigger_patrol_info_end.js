//Enter the script here

if (client.patrol && client.patrol.active) { gag_current_line(); client.patrol.active=false; client.patrol.gag=false; run_function("patrol_report", null, "patrolling"); }