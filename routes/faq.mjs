/**
* This module handles rendering of our front page.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/

import { production } from "../lib/config.mjs";

import util from "util";

import {
	is_sfw as sfw_is_sfw, 
	filter as sfw_filter
} from "../lib/sfw.mjs";

export function go(request, response) {

	let is_sfw = sfw_is_sfw(request);
	//is_sfw = true; // Debugging

	let title_home = "Is SEPTA Fucked?";
	let title = "FAQ - " + title_home;
	if (is_sfw) {
		title = sfw_filter(title);
	}

	response.render("faq.pug", {
		"title_home": title_home,
		"title": title,
		"production": production,
		"is_sfw": is_sfw,
		"uri": request["url"],
		});

} // End of go()


