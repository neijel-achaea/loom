display_notice("me: " + get_variable("party_me") + " / on: " + get_variable("party_on"), "orange");
display_notice("tar: " + get_variable("tar") + " / tarname: " + get_variable("tarname") + " (for " + get_variable("tarname_for") + ")", "orange");
display_notice("ih flag: " + get_variable("party_ih"), "orange");
display_notice("hp " + get_variable("my_hp") + "/" + get_variable("my_maxhp") + "  mp " + get_variable("my_mp") + "/" + get_variable("my_maxmp"), "orange");
display_notice("ep " + get_variable("my_ep") + "/" + get_variable("my_maxep") + "  wp " + get_variable("my_wp") + "/" + get_variable("my_maxwp"), "orange");
display_notice("rage " + get_variable("my_rage") + "  nl " + get_variable("my_nl"), "orange");
display_notice("lastsent: " + JSON.stringify(get_variable("party_last_sent")), "orange");
display_notice("data: " + JSON.stringify(get_variable("party_data")), "orange");